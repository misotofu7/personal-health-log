'use client'

export const ModalPopup = ({isModal}) => {
    return (
    <>
       <div className = "backdrop" onClick = {(isModal)}></div>
       <div className = "dialog">
        <div className = "bg-blue-300 p-8 rounded-lg shadow-xs border border-black max-w-xl">
   <div className = "p-3 rounded-full bg-blue-400 inline-block hover:bg-blue-500 transition-colors duration-1000">
    <button className = "h-6 w-6 text-blue-300 transition-colors duration-300" onClick = {(isModal)}> close modal </button>
    </div>
    
    <p className = "text-sm text-black"> test </p>
    <p className = "text-lg text-blue-950 text-center mb-5"> test popup </p>
    <h1 className = "text-md text-black text-center mb-5"> 
        test popup
    </h1>
    </div>
    </div>
    </>
    )
}