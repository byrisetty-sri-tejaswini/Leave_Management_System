import React, { useEffect, useState } from 'react';
import axios from 'axios';


interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string; // 'Pending', 'Approved', 'Rejected'
}

interface LeaveStatusProps {
  onClose: () => void;
}

const LeaveStatus: React.FC<LeaveStatusProps> = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [error, setError] = useState<string>('');

  const userid=sessionStorage.getItem('id');
  const userId = userid ? JSON.parse(userid) : null;
  

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/leave/${userId}`);
        setLeaveRequests(response.data);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Failed to fetch leave requests. Please try again later.');
      }
    };

    fetchLeaveRequests();
  }, [userId]);

  return (
    <div>
      <h2>My Leave Status</h2>
      {error && <p className="error-message">{error}</p>}
      {leaveRequests.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.leaveType}</td>
                <td>{new Date(request.startDate).toLocaleDateString()}</td>
                <td>{new Date(request.endDate).toLocaleDateString()}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveStatus;

