
const TodoSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
        <div>
          <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5" />
        </div>
        <div className="flex item-center space-x-2">
          <div className="w-20 h-9 bg-gray-300 rounded-md dark:bg-gray-700"></div>
          <div className="w-20 h-9 bg-gray-300 rounded-md dark:bg-gray-700"></div>
        </div>
    </div>
  )
}

export default TodoSkeleton