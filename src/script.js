import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const app = () => {
    const parameters = {
        time: 0,
        blackMaterialColor: '#000000',
        whiteColor: '#e0cdcd',
        blueColor: '#0808c9',
        clearColor: '#1d48d4'
    }


    /**
     * Sizes
     */
    const sizes = {
        width: document.documentElement.clientWidth,
        height: window.innerHeight
    }

    /**
     * Large text animation 
     */
    const largeText = document.querySelector('.large-text')
    let largeTextScrollDistance = sizes.width - largeText.scrollWidth

    /**
     * Base
     */
    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()


    /**
     * Lights
     */
    const light1 = new THREE.PointLight( 0xffffff, 1, 10 )
    light1.position.set( 0, 1, 6 )
    const light2 = new THREE.DirectionalLight( 0xffffff, 0.5 )
    light2.position.set( 4, 2, 2 )
    
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    scene.add(light1, light2, ambientLight)


    /**
     * Loaders
     */
    // GLTF loader
    const gltfLoader = new GLTFLoader()


    /**
     * Scroll
     */
    const scrollAnimation = () => {

        // animate geometry
        const sectionDuration = 1
        let delay = 0 

        const tl = gsap.timeline({
            paused: true,
            scrollTrigger: {
                scroller: '#viewport',
                trigger: '.wrapper',
                scrub: 2.5,
                start: 'top top',
                end: 'bottom bottom',
                invalidateOnRefresh: true,
            },
            defaults: {duration: sectionDuration, ease: 'power2.inOut'}
        })

        tl.to(group.rotation, {
            x: 0,
            y: 0,
        }, delay)
        tl.to(group.position, {
            x: () => sizes.width > 750 ? 0.75 : 0,
            y: -0.25,
            z: 0.25,
        }, delay)

        delay += sectionDuration

        tl.to(group.children[0].position, {
            y: '+=2'
        }, delay)
        tl.to(group.rotation, {
            y: -Math.PI * 0.25
        }, delay)

        delay += sectionDuration + 0.02

        tl.to(group.rotation, {
            y: -Math.PI * 1.75
        }, delay)
        tl.to(group.position, {
            y: -1,
            z: 4
        }, delay)
        tl.to(group.position, {
            x: 0
        }, delay)
        tl.to(group.children[0].position, {
            y: '-=2'
        }, delay)

        delay += sectionDuration

        tl.to(group.position, {
            y: 0,
        }, delay)
        tl.to(group.rotation, {
            x: - Math.PI * 0.5,
            y: - Math.PI * 2.5
        }, delay)
        
        
        // add to gloabal timeline
    }


    /**
     * Objects
     */
    // Texture
    const textureLoader = new THREE.TextureLoader()
    const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
    gradientTexture.magFilter = THREE.NearestFilter

    // Material
    const bottleMaterial = new THREE.MeshStandardMaterial({
        color: parameters.blueColor,
        roughness: 0.45,
        metalness: 0.7
    })

    const dozatorColor = new THREE.MeshStandardMaterial({
        color: parameters.whiteColor,
        roughness: 0.2,
        metalness: 0.1,
    })

    const blackMaterial = new THREE.MeshStandardMaterial({
        color: parameters.blackMaterialColor,
        roughness: 0.2,
        metalness: 0.4,
        side: THREE.DoubleSide,
    })


    // Model
    const group = new THREE.Group()
    let lidPosition
    gltfLoader.load(
        'bottle.glb',
        (model) => {
            const bottle = model.scene.children.find( child => child.name === 'bottle')
            const button = model.scene.children.find( child => child.name === 'button')
            const dozator = model.scene.children.find( child => child.name === 'dozator')
            const lid = model.scene.children.find( child => child.name === 'close')

            // compute normals
            bottle.geometry.computeVertexNormals()
            lid.geometry.computeVertexNormals()
            button.geometry.computeVertexNormals()
            dozator.geometry.computeVertexNormals()
            
            // apply materials
            bottle.material = bottleMaterial.clone()
            lid.material = blackMaterial.clone()
            button.material = blackMaterial.clone()
            dozator.material = dozatorColor.clone()

            // group
            group.add( lid, bottle, button, dozator )
            
            // start parameters
            lidPosition = lid.position.clone()
            group.rotation.set( Math.PI * 0.5, Math.PI * 1.75, 0 )
            group.position.set( 0, 0, 4 )
            group.children[0].position.set( lidPosition.x, lidPosition.y, lidPosition.z )
            
            scene.add( group )

            scrollAnimation()
        }
    )


    window.addEventListener('resize', () =>
    {
        if (sizes.width !== document.documentElement.clientWidth) {
            // Update sizes
            sizes.width = document.documentElement.clientWidth
            sizes.height = window.innerHeight
    
            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()
    
            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
            // Update function
            largeTextScrollDistance = sizes.width - largeText.scrollWidth
        }
    })

    /**
     * Camera
     */
    // Group
    const cameraGroup = new THREE.Group()
    scene.add(cameraGroup)

    // Base camera
    const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
    camera.position.z = 6
    cameraGroup.add(camera)

    /**
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    })
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    /**
     * Cursor
     */
    const cursor = {}
    cursor.x = 0
    cursor.y = 0

    window.addEventListener('mousemove', (event) =>
    {
        cursor.x = event.clientX / sizes.width - 0.5
        cursor.y = event.clientY / sizes.height - 0.5
    })

    /**
     * Animate
     */

    const clock = new THREE.Clock()
    let previousTime = 0

    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - previousTime
        previousTime = elapsedTime

        // Animate camera
        camera.lookAt(0, 0, 0)
        // camera.position.y = - scrollY / sizes.height * objectsDistance

        const parallaxX = cursor.x * 0.25
        const parallaxY = - cursor.y * 0.25
        cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
        cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()


    // gallery animation
    const items = gsap.utils.toArray('.store .elemnt')

    // define constatns
    items.forEach( (el, i) => {

        const tl = gsap.timeline({
            scrollTrigger: {
                scroller: '#viewport',
                ease: "power3.inOut",
                end: 'top ' + sizes.height * 0.95,
                trigger: el,
                scrub: 2
            },
        })
        
        // animate timeline
        tl.fromTo(el, { y: '120%', opacity: 0, scale: 1.1 }, {
            y: 0,
            scale: 1,
            opacity: 1,
            delay: i / 10
        }, 0)
    })

    /**
     * text animation
     */
    // large title
    const largeTextTl = gsap.timeline({
        paused: true,
        scrollTrigger: {
            scroller: '#viewport',
            start: 'top ' + sizes.height * 0.75,
            end: 'top ' + sizes.height * 0.25,
            trigger: largeText,
            scrub: 2
        },
    })
    largeTextTl.fromTo(largeText, {x: 0}, {
        x: '100%',
    },)
    largeTextTl.fromTo('.large-text span', {x: 0}, {
        x: '-100%',
    }, '<')

    // description text animation
    gsap.fromTo('.description', { y: sizes.height * 0.1 }, {
        y: -sizes.height * 0.4,
        scrollTrigger: {
            scroller: '#viewport',
            start: 'top bottom',
            end: 'bottom top',
            trigger: '.description',
            ease: 'power1,inOut',
            scrub: 1,
        }
    })
}


// RUN ON PAGE LOAD
document.addEventListener("DOMContentLoaded", function() {
    app()
});