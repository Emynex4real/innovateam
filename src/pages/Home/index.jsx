import whatsapp from "../../images/whatsapp-removebg-preview.png";
import image from "../../images/pexels-cottonbro-6344238.jpg";
import OurServices from "./our services";
import Accordionx from "../accordion";
import Data from "./../accordion/data";

const Home = () => {
  return (
    <main>
      <section className="flex justify-center container-box background-color overflow-hidden py-24 ">
        <div className="w-screen flex items-center justify-center flex-wrap gap-40 break-words px-5">
          <div className="content-text flex flex-col gap-4 justify-center break-words">
            <h1 className="lg:text-5xl sm:text-5xl font-bold header text-3xl ">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque,
              quibusdam.
            </h1>
            <p className="text-xl lg:text-2xl md:container ">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum ab
              necessitatibus quasi autem error, inventore soluta aspernatur
              pariatur repudiandae recusandae!
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button className="animated-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="arr-2"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
                <span className="text">SIGN UP</span>
                <span className="circle"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="arr-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
                </svg>
              </button>

              <div className="flex items-center">
                {/* <p className="text-xs w-32 lg:text-sm lg:w-48">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p> */}

                {/* <!-- From Uiverse.io by Mohammad-Rahme-576 -->  */}
                <div class="relative group inline-block">
                  {/* <!-- Button --> */}
                  <div class="cursor-pointer p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <svg
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-6 h-6 text-gray-700 group-hover:text-gray-900"
                    >
                      <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2v64H176C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96h96v64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"></path>
                    </svg>
                  </div>

                  {/* <!-- Tooltip --> */}
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-900 text-white text-sm rounded-md px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <div class="flex gap-3">
                      {/* <!-- Twitter --> */}
                      <a href="#" class="hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="w-6 h-6 fill-white"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                        </svg>
                      </a>

                      {/* <!-- Facebook --> */}
                      <a href="#" class="hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="w-6 h-6 fill-white"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                        </svg>
                      </a>

                      {/* <!-- LinkedIn --> */}
                      <a href="#" class="hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="w-6 h-6 fill-white"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:flex flex-col gap-6 hidden ">
            <img src={image} alt="" className="image" />
            <div className="flex justify-between text-center">
              <div className="">
                <h1 className="text-xl font-bold lg:text-3xl">2800+</h1>
                <p>Students Reached</p>
              </div>
              <div>
                <h1 className="text-xl font-bold lg:text-3xl">1.5K+</h1>
                <p>Active Users</p>
              </div>
              <div>
                <h1 className="text-xl font-bold lg:text-3xl">850+</h1>
                <p>Secured Admission</p>
              </div>
              <div>
                <h1 className="text-xl font-bold lg:text-3xl">2K+</h1>
                <p>Satisfied Students</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-center container-box py-10">
        <OurServices />
      </section>
      <section className="flex justify-center container  py-20">
        <Data />
      </section>
      <section>
        <div class="bg-gray-100 flex items-center justify-center py-28">
          <div class="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {/* <!-- Newsletter Subscription Container --> */}
            <div class="flex-1 text-center bg-green-500  p-8 rounded-2xl shadow-lg ">
              <h2 class="text-3xl text-white font-bold mb-4">Subscribe Our Newsletter</h2>
              <p class="text-gray-100 mb-6">
                Provide your email address and stay informed with our latest
                resources
              </p>
              <div class="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Enter your Email Address"
                  class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button class="bg-white text-green-500 px-6 py-2 rounded-lg  transition duration-300 text-lg font-semibold">
                  Subscribe
                </button>
              </div>
            </div>

            {/* <!-- Contact Information Container --> */}
            <div class="flex-1 text-center bg-white  p-8 rounded-2xl shadow-lg ">
              <h2 class="text-3xl font-bold mb-4">For Quick Info</h2>
              <p class="text-gray-600 mb-6 text-lg">
                Feel free to reach out to us for any inquiries or support.
              </p>
              <p class=" text-4xl font-bold">+234 803 377 2750</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
