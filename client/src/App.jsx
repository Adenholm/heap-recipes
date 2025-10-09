import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Mainpage from './pages/mainpage/Mainpage'
import Recipepage from './pages/recipePage/RecipePage'

import Header from './layout/header/Header'
import Footer from './layout/footer/Footer'
import Modal from './components/modal/modal'
import AddRecipePage from './pages/addRecipepage/AddRecipepage'

function App() {

    return (
        <BrowserRouter basename='/heap-recipes/'>
            <Header />
            <Modal />
            <Routes>
                <Route path='/recipe/:id' element={<Recipepage />} />
                <Route path='/add-recipe' element={<AddRecipePage />} />
                <Route path='/' element={<Mainpage />} />

            </Routes>
            <Footer />
        </BrowserRouter>
    )
}

export default App
