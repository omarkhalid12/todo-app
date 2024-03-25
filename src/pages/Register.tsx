import { SubmitHandler, useForm } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/InputErrorMessage";
import { REGISTER_FORM } from "../data";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";
import { Link, useNavigate } from "react-router-dom";

interface IFormInput {
  username: string
  email: string
  password: string
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const[isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: {errors} } = useForm<IFormInput>({
    resolver: yupResolver(registerSchema)
  })
  
  // ** HANDLERS
  const onSubmit: SubmitHandler<IFormInput> = async data => { 
      // ** 1 - Pending => LOADING
      setIsLoading(true)
      try {
        // ** 2 - Fulfilled => SUCCESS => (OPTIONAL)
        const { status } = await axiosInstance.post("/auth/local/register", data)
        if(status == 200){
          toast.success("You will navigate to the login page after 2 seconds from login!", {
            position: "bottom-center",
            duration: 1500,
            style: {
              background: "black",
              color: "white",
              width: "fit-content"
            }
          })
          setTimeout(() => {
            navigate('/login')
          }, 2000);
        }
      } catch (error) {
        // ** 3 - Rejected => Field => (OPTIONAL)
        const errorObj = error as AxiosError<IErrorResponse>
          toast.error(`${errorObj.response?.data.error.message}`, {
            position: "bottom-center",
            duration: 4000,
          })   
        } finally {
          setIsLoading(false)
        }
    }

  // ** RENDERS 
    const renderRegisterForm = REGISTER_FORM.map(({name, placeholder, type, validation}, index)=> 
      <div key={index}>
        <Input type={type} placeholder={placeholder} {...register(name, validation)} />
        {errors[name] && <InputErrorMessage msg={errors[name]?.message}/>}
      </div>
    )

  return (
    <div className="max-w-md mx-auto">
      <h2 className="mb-4 text-3xl font-semibold text-center">Register to get access!</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderRegisterForm}
        <Button fullWidth isLoading={isLoading}>
          Register
        </Button>
      </form>
      <div className="my-2 text-center">
        <span className="text-dark">have an email 
          <Link className="text-[#194eca] ml-1 font-semibold" to={'/login'}>Login</Link>
        </span>
      </div>
    </div>
  );
};

export default RegisterPage;
