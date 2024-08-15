"use client"

import { useAtom } from 'jotai';
import { userAtom } from '../../../store/authAtoms';


const Dashboard = () => {
  const [user] = useAtom(userAtom);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      {/* Add more dashboard content here */}
    </div>
  );
};

export default Dashboard;