interface IProps {
  msg?: string
}
const InputErrorMessage = ({msg}: IProps) => {
  return msg ? <span className="block text-sm font-semibold text-red-700">{msg}</span> : null
}

export default InputErrorMessage