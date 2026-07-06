import { Outlet } from "react-router-dom"
import Footer from "../templates/Footer"
import Header from "../templates/Header"
import FloatingCartButton from "../ui/FloatingCartButton"


const MainLayout = () => {
    return (
        <div dir="rtl" className="min-h-screen bg-moda-lightBg text-gray-800 font-sans antialiased overflow-hidden">
            <Header />
            <Outlet />
            <Footer />
            <FloatingCartButton />
        </div>

    )
}

export default MainLayout