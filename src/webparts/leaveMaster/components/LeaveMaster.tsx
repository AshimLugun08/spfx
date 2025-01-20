import * as React from 'react';
import { ILeaveMasterProps } from './ILeaveMasterProps';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import {
  TextField,
  Dropdown,
  DatePicker,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
} from '@fluentui/react';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { IPeoplePickerContext } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { IPersonaProps } from '@fluentui/react/lib/Persona';

// Define interface for Leave Item
interface ILeaveItem {
  Title: string;
  leave_type: string;
  approval_status: string;
  leave_date: string;
}

interface IUser {
  id: string;
  displayName: string;
  email: string;
}

const LIST_NAME = 'leaves_master';

// Function to initialize SharePoint context
const getSP = (context: WebPartContext): SPFI => {
  if (!context) {
    throw new Error('SharePoint context is required');
  }
  return spfi().using(SPFx(context));
};

const LeaveMaster: React.FC<ILeaveMasterProps> = ({ context }): React.ReactElement => {
  // State declarations
  const [title, setTitle] = React.useState('');
  const [leaveType, setLeaveType] = React.useState<string | null>(null);
  const [approval, setApproval] = React.useState('Pending');
  const [leaveDate, setLeaveDate] = React.useState<Date | undefined>(undefined);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [itemId, setItemId] = React.useState<string>('');
  const [fetchedItem, setFetchedItem] = React.useState<ILeaveItem | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<IUser | null>(null);

  // Create PeoplePicker context with only the required properties
  const peoplePickerContext: IPeoplePickerContext = {
    absoluteUrl: context.pageContext.web.absoluteUrl,
    spHttpClient: context.spHttpClient,
    msGraphClientFactory: context.msGraphClientFactory
  };

  // Initialize SP context
  const sp = React.useMemo(() => {
    try {
      return getSP(context);
    } catch (err) {
      const error = err as Error;
      console.error('Error initializing SP:', error);
      setError(`SharePoint initialization failed: ${error.message}`);
      return null;
    }
  }, [context]);

  const leaveTypeOptions = [
    { key: 'Sick Leave', text: 'Sick Leave' },
    { key: 'Casual Leave', text: 'Casual Leave' },
    { key: 'Annual Leave', text: 'Annual Leave' },
  ];

  const approvalOptions = [
    { key: 'Pending', text: 'Pending' },
    { key: 'Approved', text: 'Approved' },
    { key: 'Rejected', text: 'Rejected' },
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!sp) {
      setError('SharePoint context not initialized');
      return;
    }

    if (!selectedUser || !title || !leaveType || !leaveDate) {
      setError('All fields are required.');
      return;
    }

    const today = new Date();
    if (leaveDate < today) {
      setError('Leave date cannot be in the past.');
      return;
    }
    

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formattedDate = leaveDate.toISOString().split('T')[0];
      await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: title,
        leave_type: leaveType,
        approval_status: approval,
        leave_date: formattedDate,
        assigned_to: selectedUser.id,
      });

      setTitle('');
      setLeaveType(null);
      setApproval('Pending');
      setLeaveDate(undefined);
      setSelectedUser(null);

      setSuccessMessage('Your leave request has been submitted successfully!');
    } catch (err) {
      const error = err as Error;
      console.error('Error adding item:', error);
      setError(`Failed to add item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Item by ID
  const fetchItemById = async (): Promise<void> => {
    if (!sp) {
      setError('SharePoint context not initialized');
      return;
    }

    if (!itemId || isNaN(Number(itemId))) {
      setError('Please enter a valid numeric ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setFetchedItem(null);

    try {
      const item: ILeaveItem = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(Number(itemId))();
      setFetchedItem(item);
      setSuccessMessage(`Item with ID ${itemId} fetched successfully!`);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching item:', error);
      setError(`Failed to fetch item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPeoplePickerItems = (items: IPersonaProps[]): void => {
    if (items.length > 0) {
      const user: IUser = {
        id: items[0].id || '',
        displayName: items[0].text || '',
        email: items[0].secondaryText || ''
      };
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Leave Management</h2>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          {error}
        </MessageBar>
      )}

      {successMessage && (
        <MessageBar messageBarType={MessageBarType.success} isMultiline={false}>
          {successMessage}
        </MessageBar>
      )}

      {/* Add Leave Request Form */}
      <form onSubmit={handleSubmit}>
        <PeoplePicker
          context={peoplePickerContext}
          titleText="Name"
          personSelectionLimit={1}
          groupName=""
          showtooltip={true}
          required={true}
          onChange={getPeoplePickerItems}
          principalTypes={[PrincipalType.User]}
          defaultSelectedUsers={selectedUser ? [selectedUser.email] : []}
        />
        <Dropdown
          label="Leave Type"
          options={leaveTypeOptions}
          selectedKey={leaveType}
          onChange={(e, option) => setLeaveType(option?.key as string)}
          required
        />
        <Dropdown
          label="Approval"
          options={approvalOptions}
          selectedKey={approval}
          onChange={(e, option) => setApproval(option?.key as string)}
          required
        />
        <DatePicker
          label="Leave Date"
          value={leaveDate}
          onSelectDate={(date) => setLeaveDate(date || undefined)}
          isRequired
        />
        <PrimaryButton
          type="submit"
          text={loading ? 'Submitting...' : 'Submit'}
          disabled={loading}
          style={{ width: '100%', marginTop: 16 }}
        />
      </form>

      {/* Fetch Item */}
      <div style={{ marginTop: 32 }}>
        <h3>Fetch Item by ID</h3>
        <TextField
          label="Item ID"
          value={itemId}
          onChange={(e, newValue) => setItemId(newValue || '')}
        />
        <PrimaryButton
          text={loading ? 'Fetching...' : 'Fetch Item'}
          disabled={loading}
          onClick={fetchItemById}
          style={{ marginTop: 8, width: '100%' }}
        />
        {fetchedItem && (
          <div style={{ marginTop: 16, padding: 8, border: '1px solid #ccc' }}>
            <h4>Fetched Item Details</h4>
            <p><strong>Title:</strong> {fetchedItem.Title}</p>
            <p><strong>Leave Type:</strong> {fetchedItem.leave_type}</p>
            <p><strong>Approval Status:</strong> {fetchedItem.approval_status}</p>
            <p><strong>Leave Date:</strong> {fetchedItem.leave_date}</p>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Spinner size={SpinnerSize.medium} label="Processing..." />
        </div>
      )}
    </div>
  );
};

export default LeaveMaster;
