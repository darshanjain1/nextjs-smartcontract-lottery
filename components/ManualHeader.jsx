import React, { useEffect } from "react"
import { useMoralis } from "react-moralis"

export default function ManualHeader() {
    const { enableWeb3, account,isWeb3Enabled, Moralis, isWeb3EnableLoading, deactivateWeb3 } = useMoralis()
    const connect = async () => {
      await enableWeb3()
      window.localStorage.setItem('connected',"injected")
    }

    useEffect(() => {
      Moralis.onAccountChanged(account =>{
        console.log('account changed to account :>>',account);
        if(account === null){
          window.localStorage.removeItem('connected')
          deactivateWeb3()
          console.log('Null account found');
        }
      }) 
    }, [])
    
    useEffect(() => {
        if(isWeb3Enabled) return
        if(typeof window !== undefined){
          if(window.localStorage.getItem('connected'))
          enableWeb3()
        }
    }, [isWeb3Enabled])    
    
    return (
        <>
            {account ? (
                <div>
                    Connected to account {account.slice(0, 6)}...
                    {account.slice(account.length - 4)}
                </div>
            ) : (
                <button type="buttton" onClick={connect} disabled={isWeb3EnableLoading} >
                    Connect
                </button>
            )}
        </>
    )
}
