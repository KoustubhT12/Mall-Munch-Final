// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './Pages/Registration';
import Login from './Pages/Login';
import Foodcarts from './Pages/Foodcarts';
import FoodcartsContent from './Pages/FoodcartsContent';
import { ToastContainer } from 'react-toastify';
import Profile from './Pages/Profile.jsx';
import Register from './Pages/Register.jsx';
import Orders from './Pages/Orders.jsx';
import Solo from './Pages/Solo.jsx';
import Cart from './Pages/Cart.jsx';
import FoodCartRegister from './Pages/FoodCartRegister.jsx';
import FoodCartLogin from './Pages/FoodCartLogin.jsx';
import FoodCartDashboard from './Pages/FoodCartDashboard.jsx';
import FCurrentOrders from './Pages/FCurrentOrders.jsx';
import PastOrders from './Pages/PastOrders.jsx';
import Fprofile from './Pages/Fprofile.jsx';
import AddFood from './Pages/AddFood.jsx';
import Landing from './Pages/Landing.jsx'
import '../src/index.css'
function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
         <Route path="/" element={<Landing/>} />
        <Route path="/dashboard" element={<Landing/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/FoodcartRegister" element={<FoodCartRegister />} />
        <Route path="/FoodcartLogin" element={<FoodCartLogin />} />

        <Route path="/Foodcart" element={<Foodcarts />}>
          <Route index element={<FoodcartsContent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders/>} />
          <Route path="solo/:id" element={<Solo/>}/>
          <Route path="cart" element={<Cart />} />
        </Route>


        <Route path="/foodcart-dashboard" element={<FoodCartDashboard />}>
           <Route index element={<FCurrentOrders />} />
           <Route path="past-orders" element={<PastOrders />} />
           <Route path="profile" element={< Fprofile />} />
           <Route path="add-food" element={< AddFood/>} />

           
        </Route>
      </Routes>
    </Router>
  );
}

export default App;