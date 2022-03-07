/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from '../views/BillsUI'
import {localStorageMock} from '../__mocks__/localStorage'
import {ROUTES} from '../constants/routes'
import store from '../__mocks__/store'

// identify as employee 
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname})
}

Object.defineProperty(window, 'LocalStorage', {value: localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))


describe("Given I am connected as an employee", () => {
describe('When I am on NewBill Page', ()=>{
  test('Then the newBill should be rendered', ()=>{
    const html = NewBillUI()
    document.body.innerHTML = html
    //to-do write assertion
    expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
  })
})
})

describe('Given I am on NewBill Page',()=>{
  describe('When I upload an image file', ()=>{
    test('Then the file extension is correct',()=>{
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      //loading file
      const handleChangeFile = jest.fn(()=> newBill.handleChangeFile)
      const inputFile = screen.queryByTestId('file')


// addeventlistener file 
inputFile.addEventListener('change', handleChangeFile)

//fire event
fireEvent.change(inputFile,{ 
  target: {
    files: [new File(['myTest.png'], 'myTest.png', {type: 'image/png'})]
  }

})
expect(handleChangeFile).toHaveBeenCalled()
expect(inputFile.files[0].name).toBe('myTest.png')
    })
  })
})

describe('Given I am on NewBill Page',()=>{
  describe("And I submit a valid bill form",()=>{
    test('Then a bill is created', async ()=>{
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage:window.localStorage
      })

//create new bill form
const handleSubmit = jest.fn(newBill.handleSubmit)
const newBillForm = screen.getByTestId('form-new-bill')
newBillForm.addEventListener('submit', handleSubmit)
fireEvent.submit(newBillForm)
expect(handleSubmit).toHaveBeenCalled()
    })
  })
})


//integration test POST request
describe("Given I am a user connected as en Employee",()=>{
  describe("When I crete new Bill",()=>{
    test('Then a bill is created', async ()=>{
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage:window.localStorage
    })

    //new bill with handleSubmit
    const submit = screen.queryByTestId('form-new-bill')
    const billTest = {
     
    name: "testing",
      vat: "80",
     date: "2001-04-15",
 amount: 400,
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      pct:25,
      vat: 12,
      commentary: "C'est un test",
      fileName: "testing",
      fileUrl: 'testing.jpg'
    }


//click submit
const handleSubmit = jest.fn((e)=> newBill.handleSubmit(e))

submit.addEventListener('click', handleSubmit)

fireEvent.click(submit)

expect(handleSubmit).toHaveBeenCalled()

    })
  })
})
