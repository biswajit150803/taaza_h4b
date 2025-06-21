import { NavLink, useNavigate } from 'react-router-dom';
import assets from '../assets/assets';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white px-6 md:px-10 pt-16 pb-8  text-sm text-gray-700">
      <div className="flex flex-col md:grid grid-cols-[2.5fr_1fr_1fr] gap-12">
        {/* Brand and Description */}
        <div>
          <div className='flex items-center space-x-2 cursor-pointer' onClick={() => navigate('/')}>
          <img
            src={assets.logo}
            alt="FoodCheck AI Logo"
            className="w-16 h-16 mb-4 rounded-full"
          />
          <span
            className="text-3xl font-extrabold text-green-800 cursor-pointer"
            onClick={() => navigate('/')}
          >
            taaza
          </span>
          </div>
          <p className="mt-4 leading-6 text-gray-600 md:w-4/5 font-medium text-[15px]">
            FoodCheck AI helps you monitor food freshness, detect spoilage, find donation centers, and generate AI-powered recipes before your food expires. A smarter way to reduce waste and feed more.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <p className="text-xl font-semibold mb-5 text-green-600">COMPANY</p>
          <ul className="flex flex-col gap-2 font-medium">
            <li>
              <NavLink to="/" className="hover:text-green-700">Home</NavLink>
            </li>
            <li>
              <NavLink to="/about" className="hover:text-green-700">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/" className="hover:text-green-700">Careers</NavLink>
            </li>
            <li>
              <NavLink to="/" className="hover:text-green-700">Privacy Policy</NavLink>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-xl font-semibold mb-5 text-green-600">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 font-medium">
            <li className="hover:text-green-700">+91 8902247490</li>
            <li className="hover:text-green-700">abc@gmail.com</li>
          </ul>
        </div>
      </div>

      <hr className="my-8 border-green-200" />

      <p className="text-center text-sm text-gray-600">
        © 2024 <span className="text-green-700 font-semibold">FoodCheckAI.com</span> – All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
