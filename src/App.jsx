import Header from "../components/Header"
import Main from "../components/Main"
import { LanguageProvider } from "./LanguageContext"

export default function App () {
  return (
    <LanguageProvider>
      <Header /> 
      <Main />
    </LanguageProvider>
  )
}

