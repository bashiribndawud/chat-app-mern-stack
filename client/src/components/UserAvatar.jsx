import React, { useEffect } from 'react'

const UserAvatar = ({char}) => {
    const color = ['bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-red-200', 'bg-blue-200', 'bg-teal-200']
    function generateColor(){
        const colorIndex = Math.floor(Math.random() * color.length)
        return color[colorIndex]
    }
  return (
    <div
      className={`w-10 h-10 ${generateColor()}  rounded-full border flex items-center justify-center`}
    >
      {char}
    </div>
  );
}

export default UserAvatar