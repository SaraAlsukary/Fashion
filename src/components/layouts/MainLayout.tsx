import { Outlet } from "react-router-dom"
import Footer from "../templates/Footer"
import Header from "../templates/Header"


const MainLayout = () => {
    return (
        <div dir="rtl" className="min-h-screen bg-moda-lightBg text-gray-800 font-sans antialiased overflow-hidden">
            <Header />
            <Outlet />
            <Footer />

        </div>

    )
}

export default MainLayout