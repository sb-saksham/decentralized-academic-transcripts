import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequireAuth from "./hoc/RequireAuth";
import Dashboard from "./components/UI/Dashboard";
// import CompanyPage from "./components/CompanyPage";
// import IndividualRequestsPage from "./components/IndividualPage";
import UploadTranscriptsPage from "./components/UploadTranscripts";
// import HomePage from './components/UI/HomePage';
// import InstitutionPage from "./components/InstitutionPage";

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard/>}>
          {/* <Route path="" element={<HomePage />} />
            <Route path="company/" element={<RequireAuth><CompanyPage /></RequireAuth>} />
            <Route path="institution/" element={<RequireAuth><InstitutionPage /></RequireAuth>} />
            <Route path="individual/" element={<RequireAuth><IndividualRequestsPage /></RequireAuth>} />*/}
            <Route path="/transcripts/upload/" element={<UploadTranscriptsPage/>}/>
          </Route>
          </Routes>
    </BrowserRouter>
  );
}

export default App;
