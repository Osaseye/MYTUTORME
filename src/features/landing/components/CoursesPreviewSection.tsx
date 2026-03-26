import { Link } from 'react-router-dom';

export const CoursesPreviewSection = () => {
    return (
      <section className="py-24 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Top Rated Courses</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Join thousands of learners mastering new skills.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="hidden md:inline-flex items-center text-primary font-bold hover:text-primary-dark transition-colors mt-4 md:mt-0 group"
            >
              View all courses{' '}
              <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <CourseCard 
                category="Math"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBxlmfBHmW2GB7ZtJ1sJ5y5zkxgR3xY9NJlLLOTZxgYgDCbqVJPNSD6Y_yAb4Que-mesXqZCFwlLgTtl2ry9PkpIRmcCZMdA3q-HrRaBii_auAsE4-uA7l-lDU9_3ttIyrzqHDBZsYQy_lfi5qDgY_Qap2mMA47_cGY2o1fq9kJJlGvRzvQa4o-t0wwe8bV8_jXwkMpqIMmXwbRRb5sItIuHYq71TcGqOIq9dn08SSl1iTRH0s43mTZjj3zyfO3bUL0QWn7pbs3C8E"
                rating={4.8}
                title="Advanced Calculus & Linear Algebra"
                desc="Master derivatives, integrals, and vector spaces with AI assistance."
                price="15,000"
             />
             <CourseCard 
                category="Computer Science"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuB-i2q4BraDoYVQJysaeZIBEktdlD-5sFX9RYSGHvSUUFZ4pbzOk-vd-2fB5WLb0GmDkUYgqY8U6C846B-lAzDdgwCw4p1qeb7VSIgNtBsLIE0_azdkRqJCaJ8bhNzdXMYKIgWub8wVCihnYi3jOoGVM2oSAYIazoOtH9PmGGWwdXAtm6zrlDSqIfrlYGl33TKJ3hUv_4dsVQIMddHO5x_ktVudZAQKZ_Sy9wzJ7GnEl1tdwBWplrrmus4rH-jYRV9k0vU0pT6GPUE"
                rating={5.0}
                title="Python for Data Science"
                desc="Learn Python from scratch and build predictive models using real datasets."
                price="20,000"
             />
             <CourseCard 
                category="Science"
                image="https://lh3.googleusercontent.com/aida-public/AB6AXuD6WyIzMpwHyuubbZpDcNi8SeDfro0IgybEKDgB3jQWREWDiuJ2P2pUdkdHX4VHJOhRnUk01KpSOblmHUMd17957Kpl-1TskIW_z32u_7Ly1hLUY_adkfYYAmexM0huEw896MVxS-TpfWmE1iIpeen6-Q2TUEI7qKCSYAxKUhY1lqpN_8ZrLyklbdA_X0kpr4B5o9s0r1cxI3Kaoc4T4PN4iqZYrI3zhc71zK6pWgy4-bnKURB5PkTjl4i8I69leJ6jnzpyUtsDrww"
                rating={4.2}
                title="Organic Chemistry Fundamentals"
                desc="Understand molecular structures and reactions with 3D models."
                price="12,500"
             />
          </div>
        </div>
      </section>
    );
  };
  
  const CourseCard = ({ category, image, rating, title, desc, price } : any) => (
      <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col group hover:-translate-y-2">
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm">
            {category}
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
               <span key={i} className={`material-symbols-outlined text-sm ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}>star</span> 
            ))}
            <span className="text-xs font-bold text-slate-500 ml-1">({rating})</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {desc}
          </p>
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">₦{price}</span>
          </div>
        </div>
      </div>
  )
