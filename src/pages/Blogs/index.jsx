import NavBar from '../Home/navBar/index';

const Blogs = () => {
    return (
        <div className="min-h-screen bg-background-color">
            <NavBar />
            <main className="py-12 px-4 font-nunito">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Blogs</h1>
                    {/* Add your blog content here */}
                </div>
            </main>
        </div>
    );
}

export default Blogs;