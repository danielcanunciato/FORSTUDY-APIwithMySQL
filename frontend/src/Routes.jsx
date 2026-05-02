import { Route, Routes } from 'react-router-dom';

import UserDashboard from './Pages/UserDashboard';

export default function WebRoutes() {
    return(
        <>
        
            <Routes>

                <Route path='/dashboard' element={<UserDashboard />}></Route>

            </Routes>
        
        </>
    )
}