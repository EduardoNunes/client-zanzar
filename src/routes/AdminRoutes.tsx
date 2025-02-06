import { Route, Routes } from 'react-router-dom';
import Admin from '../pages/Admin';
import PostsManagement from '../pages/admin/PostsManagement';
import MessagesManagement from '../pages/admin/MessagesManagement';
import UsersManagement from '../pages/admin/UsersManagement';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Admin />} />
      <Route path="users" element={<UsersManagement />} />
      <Route path="posts" element={<PostsManagement />} />
      <Route path="messages" element={<MessagesManagement />} />
    </Routes>
  );
}
