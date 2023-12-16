export default function (number,days){
    if(days<365){
        const date = new Date(number)
        return date.getDate()+"/"+(date.getMonth('/')+1)
    }
    else {
        const date = new Date(number)
        return (date.getMonth('/')+1)+"/"+date.getFullYear()%2000
    }
}