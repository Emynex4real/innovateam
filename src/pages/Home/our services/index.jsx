import waecchecker from '../../../images/waec-result-checker.jpg'
import necochecker from '../../../images/neco-result-checker.jpg'
import nabtebchecker from '../../../images/nabteb-result-checker.jpg'
import waecverification from '../../../images/waec-verification.jpg'
import nin from '../../../images/nin.jpg'
import bvn from '../../../images/bvn.jpg'
import datasubscription from '../../../images/data-subscription.jpg'
import olevelupload from '../../../images/olevel-upload.jpg'

const OurServices = () => {
  return (
    <div className='w-10/12 flex items-center justify-between'>
      <div className=' container flex flex-col justify-center items-center gap-16'>
        <h1 className='font-bold text-4xl'>OUR SERVICES</h1>
        <div className=''>
          <ul className='flex gap-5 items-center flex-wrap justify-center'>
            <li className='bg-green-500 py-1 px-5 text-white'>All</li>
            <li>Exam Scratch Cards</li>
            <li>Data Subscription</li>
            <li>Other Services</li>
          </ul>
        </div>
        <div className=' container flex justify-between service-box flex-wrap gap-5'>
          <div className='flex flex-col gap-3'>
            <div>
              <img src={waecchecker} alt="" className='w-72 rounded-lg'/>
              <h1 className='font-bold text-xl text-green-500 '>WAEC Result Checker</h1>
            </div>
            <p className='font-bold'>₦ 3,400.00</p>
            <button className='border py-2 bg-green-500 rounded-lg text-white font-bold'>Proceed</button>
          </div>
          <div className='flex flex-col gap-3'>
            <div>
              <img src={necochecker} alt="" className='w-72 rounded-lg'/>
              <h1 className='font-bold text-xl text-green-500'>NECO Result Checker</h1>
            </div>
            <p className='font-bold'>₦ 1,300.00</p>
            <button className='border py-2 bg-green-500 rounded-lg text-white font-bold'>Proceed</button>
          </div>
          <div className='flex flex-col gap-3'>
            <div>
              <img src={nabtebchecker} alt="" className='w-72 rounded-lg'/>
              <h1 className='font-bold text-xl text-green-500'>NABTEB Result Checker</h1>
            </div>
            <p className='font-bold'>₦ 900.00</p>
            <button className='border py-2 bg-green-500 rounded-lg text-white font-bold'>Proceed</button>
          </div>
          <div className='flex flex-col gap-3'>
            <div>
              <img src={datasubscription} alt="" className='w-72 rounded-lg'/>
              <h1 className='font-bold text-xl text-green-500'>Data Subscription</h1>
            </div>
            <p className='font-bold'>₦ 200.00</p>
            <button className='border py-2 bg-green-500 rounded-lg text-white font-bold'>Proceed</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
