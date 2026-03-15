import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export default function BackToTop() {

  const [visible, setVisible] = useState(false)

  useEffect(() => {

    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)

  }, [])

  const scrollToTop = () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })

  }

  if (!visible) return null

  return (

    <button
    
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex items-center 
      justify-center w-12 h-12 rounded-full bg-gradient-to-r 
      from-blue-600 to-purple-600 text-white shadow-lg hover:scale-110 
      transition-all duration-200 animate-in fade-in"
      aria-label="Back to top"
    >

      <ArrowUp className="w-5 h-5" />

    </button>

  )

}