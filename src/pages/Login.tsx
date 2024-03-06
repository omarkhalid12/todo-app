import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { LOGIN_FORM } from "../data";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";
import { Link } from "react-router-dom";

interface IFormInput {
  identifier: string
  password: string
}

const LoginPage = () => {
  const[isLoading, setIsLoading] = useState(false)
    
  const { register, handleSubmit, formState: {errors} } = useForm<IFormInput>({
    resolver: yupResolver(loginSchema)
  })

  // ** HANDLERS
  const onSubmit: SubmitHandler<IFormInput> = async data => { 
  // ** 1 - Pending => LOADING
  setIsLoading(true)
  
    try {
      // ** 2 - Fulfilled => SUCCESS => (OPTIONAL)
      const { status, data: resData } = await axiosInstance.post("/auth/local", data)
      console.log(resData);
      
      if(status == 200){
        toast.success("You will navigate to the home page after 2 seconds!", {
          position: "bottom-center",
          duration: 1500,
          style: {
            background: "black",
            color: "white",
            width: "fit-content"
          }
        })
        localStorage.setItem("loggedInUser", JSON.stringify(resData))
        setTimeout(() => {
          location.replace('/')
        }, 2000);
      }
    } catch (error) {
      // ** 3 - Rejected => Field => (OPTIONAL)
      const errorObj = error as AxiosError<IErrorResponse>
        toast.error(`${errorObj.response?.data.error.message}`, {
          position: "bottom-center",
          duration: 1500,
        })   
      } finally {
        setIsLoading(false)
      }
  }

  // ** RENDERS 
  const renderLoginForm = LOGIN_FORM.map(({name, placeholder, type, validation}, index)=> 
    <div key={index}>
      <Input type={type} placeholder={placeholder} {...register(name, validation)} />
      {errors[name] && <InputErrorMessage msg={errors[name]?.message}/>}
    </div>
  )

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">Login to get access!</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderLoginForm}
        <Button fullWidth isLoading={isLoading}>
          Login
        </Button>
      </form>
      <div className="my-2 text-center">
        <span className="text-dark">don't have an email 
          <Link className="text-[#194eca] ml-1 font-semibold" to={'/register'}>Register</Link>
        </span>
      </div>
    </div>
  );
};

export default LoginPage;
