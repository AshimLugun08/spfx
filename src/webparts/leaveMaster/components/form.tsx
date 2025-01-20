import * as React from 'react';
import { useState } from 'react';
import styles from './LeaveMaster.module.scss';

interface ILeaveMasterFormProps {
  onSubmit: (data: {
    employeeName: string;
    leaveType: string;
    approval: string;
    leaveDate: string;
   
  }) => void;
}

const LeaveMasterForm: React.FC<ILeaveMasterFormProps> = ({ onSubmit }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [approval, setApproval] = useState('Pending');
  const [leaveDate, setLeaveDate] = useState('');
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit({ employeeName, leaveType, approval, leaveDate });
  };


  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="employeeName" className={styles.label}>Employee Name</label>
        <input
          type="text"
          id="employeeName"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          className={styles.inputField}
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="leaveType" className={styles.label}>Leave Type</label>
        <select
          id="leaveType"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className={styles.inputField}
        >
          <option value="">Select Leave Type</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Maternity Leave">Maternity Leave</option>
          <option value="Vacation Leave">Vacation Leave</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="approval" className={styles.label}>Approval Status</label>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="approval"
              value="Approved"
              checked={approval === 'Approved'}
              onChange={() => setApproval('Approved')}
            />
            Approved
          </label>
          <label>
            <input
              type="radio"
              name="approval"
              value="Pending"
              checked={approval === 'Pending'}
              onChange={() => setApproval('Pending')}
            />
            Pending
          </label>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="leaveDate" className={styles.label}>Leave Date</label>
        <input
          type="date"
          id="leaveDate"
          value={leaveDate}
          onChange={(e) => setLeaveDate(e.target.value)}
          className={styles.inputField}
        />
      </div>

   

      <button type="submit" className={styles.submitButton}>Submit</button>
    </form>
  );
};

export default LeaveMasterForm;
