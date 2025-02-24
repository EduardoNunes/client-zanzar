import { Route, Routes } from 'react-router-dom';
import Admin from '../pages/Admin';
import PostsManagement from '../pages/admin/PostsManagement';
import MessagesManagement from '../pages/admin/MessagesManagement';
import UsersManagement from '../pages/admin/UsersManagement';
import RecentActivityManagement from '../pages/admin/RecentActivityManagement';
import { AdvertisementsManagementPage } from '../pages/admin/AdvertisementsManagementPage';
import InvitesManagement from '../pages/admin/InvitesManagement';


export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Admin />} />
      <Route path="activity" element={<RecentActivityManagement />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="posts" element={<PostsManagement />} />
      <Route path="messages" element={<MessagesManagement />} />
      <Route path="ads" element={<AdvertisementsManagementPage />} />
      <Route path="invites-management" element={<InvitesManagement />} />
    </Routes>
  );
}
