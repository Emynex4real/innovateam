import aboutus from '../../images/arewa_gate_about-2.jpg'

const About = () => {
    return ( <div>
        <main className='py-5 flex flex-col gap-10 px-5' >
            <section className='flex gap-10 justify-center items-center py-24 flex-wrap'>
                <div>
                    <img src={aboutus} alt="" className='w-96 rounded-2xl'/>
                </div>
                <div className='w-96'>
                <h1 className='text-2xl font-bold'>About Us</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum consectetur, harum velit porro quidem dolores molestias quisquam, maxime ad architecto odit rerum ipsam explicabo unde facilis alias et omnis iusto fugiat, aut fugit vero? Dolores hic ab fuga delectus facilis fugiat maiores, eveniet, eum eligendi beatae distinctio sed? Vitae, minima?</p>
                </div>

            </section>
            <section id="qualities" class="index-2">
        <div class="container border flex justify-center">
            <div class="">
              <div class="content ">
              <div class="row flex gap-5">
            <div class="py-3 px-5">
              <div class="icon"><i class="flat flaticon-reward border"></i></div>
              <div class="heading">
                <h5>We are Professional</h5>
              </div>
              
            </div>
            <div class="">
              <div class="icon"><i class="flat flaticon-certificate"></i></div>
              <div class="heading">
                <h5>Licensed and Certified</h5>
              </div>
              
            </div>
            <div class="">
              <div class="icon"><i class="flat flaticon-enterprise"></i></div>
              <div class="heading">
                <h5>24/7 Customer Support</h5>
              </div>
              
            </div>
            <div class="">
              <div class="icon"><i class="flat flaticon-working-team"></i></div>
              <div class="heading">
                <h5>Fast &amp; Secured</h5>
              </div>
              
            </div>
          </div></div>
        </div>
        </div>
    </section>
        </main>
    </div> );
}
 
export default About;