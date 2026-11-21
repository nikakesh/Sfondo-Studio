const DateContainer = document.querySelector('.lockscreen-date')
const TimeContainer = document.querySelector('.lockscreen-time')

const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const now = new Date()

DateContainer.innerText = `${Days[now.getDay()]}, ${now.getDate()} ${Months[now.getMonth()]}`

const UpdateTime = () => {
    const now = new Date()
    const SPACE1 = now.getHours().toString().length == 1 ? '0' : ''
    const SPACE2 = now.getMinutes().toString().length == 1 ? '0' : ''
    TimeContainer.innerText = `${SPACE1 + now.getHours().toString()}:${SPACE2 + now.getMinutes().toString()}`
}
UpdateTime()
setInterval(UpdateTime, 1000)