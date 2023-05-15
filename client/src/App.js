import "./App.css";
import Landing from "./components/Landing";
import Login from "./components/Login";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/editor" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
