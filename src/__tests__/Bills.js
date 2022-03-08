/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import {fireEvent,screen,waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills'
import router from "../app/Router.js";
import {ROUTES} from '../constants/routes'
import store from '../__mocks__/store.js';




describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

      expect(windowIcon.classList.contains('active-icon')).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills
      })

      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given I try to connect Bill page as an Employee", () => {
  describe('When I am Login Page', () => {
    test('Then it should render LoadingPage', () => {
      //loading Page
      document.body.innerHTML = BillsUI({
        loading: true
      })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
    //error Page
    test("Then it should render ErrorPage", () => {
      document.body.innerHTML = BillsUI({error: true})
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

describe('When I am on Bills page but back-end send an error message', () => {
  test('Then, Error page should be rendered', () => {
    document.body.innerHTML = BillsUI({
      error: 'some error message'
    })
    expect(screen.getAllByText('Erreur')).toBeTruthy()
  })
})

describe('When there are bills on the Bill page',()=>{
  test('It should display an icon eye', () => {
    document.body.innerHTML = BillsUI({data: bills})
    const iconEye = screen.getAllByTestId('icon-eye')
    expect(iconEye).toBeTruthy()
  })
})

describe('Given I am employee', () => {
  describe('When I navigate to Bill page', () => {

    test('When I click on new bill button then a modal should open', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        })
      }
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({
        data: bills
      })
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage
      })
      $.fn.modal = jest.fn()

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill)

      const iconNewBill = screen.getByTestId('btn-new-bill')
      iconNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(iconNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()

      const modale = screen.getAllByTestId('form-new-bill')
      expect(modale).toBeTruthy()
    })
  })
})


//test d'integration GET
describe('Given I am employee', ()=>{
  describe('When I navigate to Bill page', ()=>{


    test('When I click on new bill then a modal should open',()=>{
      const onNavigate=(pathname)=>{
        document.body.innerHTML = ROUTES({pathname})
      }
      Object.defineProperty(window, 'localStorage', {
        value:localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type:'Employee'
        }))

        const html = BillsUI({data: bills})
        document.body.innerHTML = html

        const bill= new Bills({
          document, onNavigate, store: null, bills, localStorage: window.localStorage
        })
        $.fn.modal = jest.fn()

        const handleClickNewBill = jest.fn((e)=> bill.handleClickNewBill)

        const iconNewBill = screen.getByTestId('btn-new-bill')
        iconNewBill.addEventListener('click', handleClickNewBill)
        fireEvent.click(iconNewBill)

        expect(handleClickNewBill).toHaveBeenCalled()

          const modale = screen.getByTestId('form-new-bill')
          expect(modale).toBeTruthy()
    })

test('When I click on eye to show details of bill a modal should open', async()=>{
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname})
  }
Object.defineProperty(window, 'localStorage', {value: localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type:'Employee'}))

const html = BillsUI({data: bills})
document.body.innerHTML= html

const bill = new Bills({
  document, onNavigate, store:null, bills, localStorage: window.localStorage
})
$.fn.modal = jest.fn()

const handleClickIconEye = jest.fn((e) => bill.handleClickIconEye(eye[0]))

const eye = screen.getAllByTestId('icon-eye')
eye[0].addEventListener('click', handleClickIconEye)
fireEvent.click(eye[0])

expect(handleClickIconEye).toHaveBeenCalled()

const modale = screen.getAllByTestId('modaleFile')
expect(modale).toBeTruthy()
})
test('fetches bill from mock API GET and data.length = 4', async ()=>{
  const getSpy = jest.spyOn(store, 'bills')
  const bills = await store.list()
  expect(getSpy).toHaveBeenCalledTimes(1)
  expect(bills).toBeDefined()
  expect(bills.data.length).toBe(4)
})

test('fetches bills from an API then fails with 404 message error', async ()=>{
  store.get.mockImplementationOnce(()=>{
    Promise.reject(new Error('Erreur 404'))
  })
const html = BillsUI({error: 'Erreur 404'})
document.body.innerHTML = html
const message = await screen.getByText(/Erreur 404/)
expect(message).toBeTruthy()
})
test ('fetches messages from an API and fails with 500 message error', async ()=>{
  store.bills.mockImplementationOnce(() => {
    return {
      list : () =>  {
        return Promise.reject(new Error("Erreur 500"))
      }
    }})

  window.onNavigate(ROUTES_PATH.Bills)
  await new Promise(process.nextTick);
  const message = await screen.getByText(/Erreur 500/)
  expect(message).toBeTruthy()
})
  })
})

