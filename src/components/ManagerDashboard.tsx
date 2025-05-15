import React from 'react';


const ManagerDashboard = () => {
    return (
        <div>
            <h2>Manager Dashboard</h2>
            <div className='buttons'>
                <button>View Team Details</button>
                <button>View Active Team Leave Requests</button>
                <button>View Team Leave Request History</button>
            </div>
        </div>
    );
};

export default ManagerDashboard;
