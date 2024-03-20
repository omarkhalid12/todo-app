import Button from "./ui/Button";
import useAuthenticatedQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { ChangeEvent, FormEvent, useState } from "react";
import Textarea from "./ui/Textarea";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";

const TodoList = () => {

  const storageKey = "loggedInUser"
  const userDataString = localStorage.getItem(storageKey)
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  const [isOpenEditModal, setIsOpenEditModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [todoEdit, setTodoEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: ""
  })

  /** FETCH DATA USING REACT QUERY **/
  const {data, isLoading} = useAuthenticatedQuery({url: "/users/me?populate=todos",
  queryKey: ["todoList", `${todoEdit.id}`], 
  config: {
    headers: {
      Authorization: `Bearer ${userData.jwt}`
    }
  }})

  // ** Handlers
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

  const closeConfirmModal = ()=> setIsOpenConfirmModal(false)
  const openConfirmModal = ()=> setIsOpenConfirmModal(true)

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> {
    const {value, name} = event.target

    setTodoEdit({
      ...todoEdit,
      [name]: value
    })
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
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false)
    }
  }

  if(isLoading) return <h3>Loading ...</h3> 

  return (
    <div className="space-y-1 ">
      {data.todos.length ? data.todos.map((todo: ITodo) => (
        <div key={todo.id} className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100">
          <p className="w-full font-semibold">1 - {todo.title}</p>
          <div className="flex items-center justify-end w-full space-x-3">
            <Button size={"sm"} onClick={()=> onOpenEditModal(todo)}>Edit</Button>
            <Button variant={"danger"} size={"sm"} onClick={openConfirmModal}>
              Remove
            </Button>
          </div>
        </div>
      )) : <h3>No todos Yet!</h3>}
      {/* Edit todo Modal */}
      <Modal isOpen={ isOpenEditModal } closeModal={ onCloseEditModal } title="Edit this todo" >
        <form className="space-y-3" onSubmit={submitHandler}>
          <Input name="title" value={todoEdit.title} onChange={onChangeHandler}/>
          <Textarea name="description" value={todoEdit.description} onChange={onChangeHandler}/>
          <div className="flex item-center space-x-3 mt-4">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>Update</Button>
            <Button variant={"cancel"}>Cancel</Button>
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
          <Button variant={"danger"} onClick={()=> {}}>
            Yes, remove
          </Button>
          <Button variant={"cancel"} onClick={closeConfirmModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
