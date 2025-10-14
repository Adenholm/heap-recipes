import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Mainpage from './pages/mainpage/Mainpage'
import Recipepage from './pages/recipePage/RecipePage'

import Header from './layout/header/Header'
import Footer from './layout/footer/Footer'
import Modal from './components/modal/modal'
import AddRecipePage from './pages/addRecipepage/AddRecipepage'
import EditRecipePage from './pages/editRecipepage/EditRecipePage'
import { ProtectedRoute } from './context/auth'
import EditTagsPage from './pages/editTagspage/EditTagspage'

function App() {

    return (
        <BrowserRouter basename='/heap-recipes/'>
            <Header />
            <Modal />
            <Routes>
                <Route path='/recipe/:id' element={<Recipepage />} />
                <Route path='/' element={<Mainpage />} />
                <Route
                    path='/add-recipe'
                    element={
                        <ProtectedRoute>
                            <AddRecipePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/edit-recipe/:id'
                    element={
                        <ProtectedRoute>
                            <EditRecipePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/edit-tags/'
                    element={
                        <ProtectedRoute>
                            <EditTagsPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}

export default App
