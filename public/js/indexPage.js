document.addEventListener('DOMContentLoaded', () => {
    let options = {
        root:null,
        rootMargin: "0px 0px 0px 2000px",
        threshold: 0.5
    }
    let observer = new IntersectionObserver(crossing, options)
    const allCards =document.querySelectorAll('.card')
    for (let card of allCards){
        observer.observe(card); //---> here we are observing all p
    }
    function crossing(entries, ob){ // entrie is an array of all the things that the observer is watching in this case all the paragraphs. and ob is the variable observer 
        for (let entry of entries){
            if(entry.isIntersecting){
                entry.target.classList.add('onView') // the .target refers to the html of the element
                ob.unobserve(entry.target) // this saves resources by stop observing the element if i want to leave the elements like that
            }  
        }
    }
})
