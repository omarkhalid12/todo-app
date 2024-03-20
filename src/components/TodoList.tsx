import Button from "./ui/Button";
import useAuthenticatedQuery from "../hooks/useCustomQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { ChangeEvent, FormEvent, useState } from "react";
import Textarea from "./ui/Textarea";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";

const TodoList = () => {

  const storageKey = "loggedInUser"
  const userDataString = localStorage.getItem(storageKey)
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  const [queryVersion, setQueryVersion] = useState(1);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpenEditModal, setIsOpenEditModal] = useState(false)
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  
  const [todoAdd, setTodoAdd] = useState({
    title: "",
    description: ""
  })
  
  const [todoEdit, setTodoEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: ""
  })

  /** FETCH DATA USING REACT QUERY **/
  const {data, isLoading} = useAuthenticatedQuery({url:"/users/me?populate=todos",
  queryKey: ["todoList", `${queryVersion}`], 
  config: {
    headers: {
      Authorization: `Bearer ${userData.jwt}`
    }
  }})

  // ** Handlers
  const onCloseAddModal = ()=> {
    setTodoAdd({
      title: "",
      description: ""
    })
    setIsOpenAddModal(false)
  }
  const onOpenAddModal = ()=> {
    setIsOpenAddModal(true)
  }
  const onCloseEditModal = ()=> {
    setTodoEdit({
      id: 0,
      title: "",
      description: ""
    })
    setIsOpenEditModal(false)
  }
  const onOpenEditModal = (todo: ITodo)=> {
    setTodoEdit(todo)
    setIsOpenEditModal(true)
  }

  const closeConfirmModal = ()=> {
    setTodoEdit({
      id: 0,
      title: "",
      description: ""
    })
    setIsOpenConfirmModal(false)
  }
  const openConfirmModal = (todo: ITodo)=> {
    setTodoEdit(todo)
    setIsOpenConfirmModal(true)
  }

  const onChangeAddTodoHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> {
    const {value, name} = event.target

    setTodoAdd({
      ...todoAdd,
      [name]: value
    })
  }
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> {
    const {value, name} = event.target

    setTodoEdit({
      ...todoEdit,
      [name]: value
    })
  }

  const onRemove = async()=> {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoEdit.id}`, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`
        }
      })
      if(status == 200) {
        closeConfirmModal()
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const submitAddTodoHandler = async(event: FormEvent<HTMLFormElement>)=> {
    event.preventDefault()

    setIsUpdating(true)

    const {title, description} = todoAdd
    try {
      const { status } = await axiosInstance.post(`/todos}`, {data: title, description}, 
      {headers: {
        Authorization: `Bearer ${userData.jwt}`
      }})
      if(status == 200) {
        onCloseAddModal()
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false)
    }
  }
  const submitHandler = async(event: FormEvent<HTMLFormElement>)=> {
    event.preventDefault()

    setIsUpdating(true)

    const {title, description} = todoEdit
    try {
      const { status } = await axiosInstance.put(`/todos/${todoEdit.id}`, {data: title, description}, 
      {headers: {
        Authorization: `Bearer ${userData.jwt}`
      }})
      if(status == 200) {
        onCloseEditModal()
        setQueryVersion(prev => prev + 1)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false)
    }
  }

  if(isLoading) return (
    <div className="p-3 space-y-1">
      {Array.from({length: 3}, (_, index)=> (
        <TodoSkeleton key={index} />
      ))}
    </div>
  )

  return (
    <div className="space-y-1 ">
      <div className="mx-auto my-10 w-fit">
        <Button size={"sm"} onClick={onOpenAddModal}>Post a new todo</Button>
      </div>
      {data.todos.length ? 
        data.todos.map((todo: ITodo) => (
          <div key={todo.id} className="flex items-center justify-between p-3 duration-300 rounded-md hover:bg-gray-100 even:bg-gray-100">
            <p className="w-full font-semibold">{todo.id} - {todo.title}</p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button size={"sm"} onClick={()=> onOpenEditModal(todo)}>Edit</Button>
              <Button variant={"danger"} size={"sm"} onClick={()=> openConfirmModal(todo)}>
                Remove
              </Button>
            </div>
          </div>
        )) 
      : <h3>No todos Yet!</h3>}
      {/* Add todo Modal */}
      <Modal isOpen={ isOpenAddModal } closeModal={ onCloseAddModal } title="Add a new todo" >
        <form className="space-y-3" onSubmit={submitAddTodoHandler}>
          <Input name="title" value={todoAdd.title} onChange={onChangeAddTodoHandler}/>
          <Textarea name="description" value={todoAdd.description} onChange={onChangeAddTodoHandler}/>
          <div className="flex mt-4 space-x-3 item-center">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>Done</Button>
            <Button variant={"cancel"} onClick={onCloseAddModal} type="button">Cancel</Button>
          </div>
        </form>
      </Modal>
      {/* Edit todo Modal */}
      <Modal isOpen={ isOpenEditModal } closeModal={ onCloseEditModal } title="Edit this todo" >
        <form className="space-y-3" onSubmit={submitHandler}>
          <Input name="title" value={todoEdit.title} onChange={onChangeHandler}/>
          <Textarea name="description" value={todoEdit.description} onChange={onChangeHandler}/>
          <div className="flex mt-4 space-x-3 item-center">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>Update</Button>
            <Button variant={"cancel"} type="button">Cancel</Button>
          </div>
        </form>
      </Modal>
      {/* DELETING PRODUCT CONFIRM MODAL */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this Product from your Store?"
        description="Deleting this product will remove it permanently from your inventory. 
        Any associated data, sales history, and other related information will also be deleted. 
        Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3">
          <Button variant={"danger"} onClick={onRemove}>
            Yes, remove
          </Button>
          <Button variant={"cancel"} onClick={closeConfirmModal} type="button">
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
