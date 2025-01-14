import * as React from 'react';
import { ILeaveMasterProps } from './ILeaveMasterProps';
import LeaveMasterForm from './form';
import styles from './LeaveMaster.module.scss';

export default class LeaveMaster extends React.Component<ILeaveMasterProps> {
  constructor(props: ILeaveMasterProps) {
    super(props);
  }

  // handle submit method to pass the data
  private handleSubmit = (data: { leaveType: string; leaveDate: string; employeeName: string }) => {
    console.log('Leave Request Submitted:', data);
    // You can add additional logic here, like sending the data to an API or saving it
  };

  render(): React.ReactElement<ILeaveMasterProps> {
    return (
      <section className={styles.leaveMasterSection}>
        <h2 className={styles.formTitle}>Leave Master Form</h2>
        {/* Passing handleSubmit method to the form component */}
        <LeaveMasterForm onSubmit={this.handleSubmit} />
      </section>
    );
  }
}
