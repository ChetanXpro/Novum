import { useAtom } from "jotai";
import { tokenAtom } from "../store/authAtoms";


export const useSetToken = () => {
    const [, setToken] = useAtom(tokenAtom);
    
    return (newToken: string) => {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    };
  };