import React from 'react'

function Marquee({imagesUrl}) {
  return (
    <div className="flex w-full py-10 gap-20 overflow-hidden ">
        { imagesUrl.map( url => <img className="w-[6.5vw] flex-shrink-0" src={url}/> ) }
        { imagesUrl.map( url => <img className="w-[6.5vw] flex-shrink-0" src={url}/> ) }
    </div>
  )
}

export default Marquee