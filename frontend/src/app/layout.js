import Navbar from "../components/Navbar/page.js"
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}