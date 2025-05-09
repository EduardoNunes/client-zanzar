import { Route, Routes } from "react-router-dom";
import UserStore from "../pages/UserStore";
import UserOrderStore from "../pages/UserOrderStore";
import StoreOwnerRoute from "./StoreOwnerRoute";

export default function StoreRoutes() {
  return (
    <Routes>
      <Route path=":slug" element={<UserStore />} />
      <Route
        path=":slug/orders"
        element={
          <StoreOwnerRoute>
            <UserOrderStore />
          </StoreOwnerRoute>
        }
      />
    </Routes>
  );
}
