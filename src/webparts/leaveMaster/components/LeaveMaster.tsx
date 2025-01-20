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
  IDropdownOption,
  DatePicker,
  PrimaryButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Dialog,
  DialogFooter,
  DialogType,
  DefaultButton,
} from '@fluentui/react';

const LIST_NAME = 'leaves_master';

const getSP = (context: WebPartContext): SPFI => {
  if (!context) {
    throw new Error('SharePoint context is required');
  }
  return spfi().using(SPFx(context));
};

const LeaveMaster: React.FC<ILeaveMasterProps> = ({
  description,
  listName,
  context,
  isDarkTheme,
  userDisplayName,
}) => {
  const [title, setTitle] = React.useState('');
  const [leaveType, setLeaveType] = React.useState('Sick Leave'); // Default value
  const [approval, setApproval] = React.useState('Pending');
  const [leaveDate, setLeaveDate] = React.useState<Date | undefined>(undefined);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // State for Dialog

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

  const leaveTypeOptions: IDropdownOption[] = [
    { key: 'Sick Leave', text: 'Sick Leave' },
    { key: 'Casual Leave', text: 'Casual Leave' },
    { key: 'Annual Leave', text: 'Annual Leave' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!sp) {
      setError('SharePoint context not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedDate = leaveDate ? leaveDate.toISOString().split('T')[0] : '';
      await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: title,
        leave_type: leaveType,
        aproval: approval,
        leave_date: formattedDate,
      });

      // Reset form fields
      setTitle('');
      setLeaveType('Sick Leave');
      setApproval('Pending');
      setLeaveDate(undefined);

      // Show success dialog
      setIsDialogOpen(true);
    } catch (err) {
      const error = err as Error;
      console.error('Error adding item:', error);
      setError(`Failed to add item: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Submit Leave Request</h2>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          {error}
        </MessageBar>
      )}

      <TextField
        label="Title"
        value={title}
        onChange={(e, newValue) => setTitle(newValue || '')}
        required
      />

      <Dropdown
        label="Leave Type"
        options={leaveTypeOptions}
        selectedKey={leaveType}
        onChange={(e, option) => setLeaveType(option?.key as string)}
        required
      />

      <TextField
        label="Approval"
        value={approval}
        onChange={(e, newValue) => setApproval(newValue || '')}
        required
      />

      <DatePicker
        label="Leave Date"
        value={leaveDate}
        onSelectDate={(date) => setLeaveDate(date || undefined)}
        isRequired
      />

      <div style={{ marginTop: 16 }}>
        <PrimaryButton
          type="submit"
          text={loading ? 'Submitting...' : 'Submit'}
          disabled={loading}
          style={{ width: '100%' }}
        />
      </div>

      {loading && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Spinner size={SpinnerSize.medium} label="Submitting..." />
        </div>
      )}

      {/* Dialog for Success */}
      <Dialog
        hidden={!isDialogOpen}
        onDismiss={() => setIsDialogOpen(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Success',
          subText: 'Your leave request has been submitted successfully!',
        }}
        modalProps={{
          isBlocking: true,
        }}
      >
        <DialogFooter>
          <DefaultButton onClick={() => setIsDialogOpen(false)} text="Close" />
        </DialogFooter>
      </Dialog>
    </form>
  );
};

export default LeaveMaster;
