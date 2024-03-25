import Paginator from "../components/Paginator";
import TodoSkeleton from "../components/TodoSkeleton";
import useCustomQuery from "../hooks/useCustomQuery"

const TodosPage = () => {
  const storageKey = "loggedInUser"
  const userDataString = localStorage.getItem(storageKey)
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const {data, isLoading} = useCustomQuery({
    queryKey: ["paginatedTodos"],
    url:"/todos",
      config: {
        headers: {
          Authorization: `Bearer ${userData.jwt}`
        },
      }
    }
  )  

  if(isLoading) return (
    <div className="p-3 space-y-1">
      {Array.from({length: 25}, (_, index)=> (
        <TodoSkeleton key={index} />
      ))}
    </div>
  )

  return (
    <div className="my-20 space-y-6">
      {data.data.length ? (
      data.data.map(({id, attributes}: {id: number; attributes: {title: string} }) => (
        <div key={id} className="flex items-center justify-between p-3 duration-300 rounded-md hover:bg-gray-100 even:bg-gray-100">
          <h3 className="w-full font-semibold">{id} - {attributes.title}</h3>
        </div>
      )) 
      ) : (
        <h3>No todos Yet!</h3> 
      )}
      <Paginator />
    </div>
  )
}

export default TodosPage