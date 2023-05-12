import { useEffect, useRef, useState } from "react";
import { Button } from "../components/Button";
import { List } from "../components/List";
import { ListItem } from "../components/ListItem";
import { miniFetch } from "../functions/util";
import { UrlEnum } from "../const/Enums/urlEnum";
import { AgitoEvent, ResponseEvent, SelectedEvent } from "../interfaces/event";
import { ImageCarousel } from "../components/ImageCarousel";
import { HeaderButtonEnum } from "../const/Enums/headerButtonEnum";
import { EventsEnum } from "../const/Enums/eventsEnum";
import { CarouselButtonAction } from "../const/Enums/carouselButtonAction";


export function Index() {
    const [coverages, setCoverages] = useState<AgitoEvent[]>([])
    const [schedule, setSchedule] = useState<AgitoEvent[]>([])
    const [coverageSelected, setCoverageSelected] = useState<boolean>(true)
    const [mainEvent, setMainEvent] = useState<SelectedEvent | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null)
    const [page, setPage] = useState<number>(1)

    const eventsPerPage = 6

    const events: { data: AgitoEvent[], type: EventsEnum } = coverageSelected ?
        { data: coverages, type: EventsEnum.COVERAGES } :
        { data: schedule, type: EventsEnum.SCHEDULE }

    const homeRef = useRef<HTMLButtonElement | null>(null)
    const listRef = useRef<HTMLButtonElement | null>(null)
    const aboutRef = useRef<HTMLButtonElement | null>(null)
    const returnRef = useRef<HTMLButtonElement | null>(null)

    async function getSelectedEvent(value: string): Promise<SelectedEvent | null> {
        if (value) {
            const data = await miniFetch(UrlEnum.EVENTS + value)
            const auxArray: string[] = []
            data.forEach((element: any) => {
                auxArray.unshift(`${UrlEnum.IMAGE}?id=${element.id}`)
            })
            const event: SelectedEvent = {
                id: value,
                imagesUrl: auxArray
            }
            return event
        }
        return null
    }

    function handleButtonClick(value: string) {
        const getImagesUrlByEvent = async () => {
            const data = await miniFetch(UrlEnum.EVENTS + schedule[0].id)
            const auxArray: string[] = []
            data.forEach((element: any) => {
                auxArray.unshift(`${UrlEnum.IMAGE}?id=${element.id}`)
            })
            setSelectedEvent({
                id: schedule[0].id, imagesUrl: auxArray
            })
            switch (value) {
                case HeaderButtonEnum.START:
                    homeRef.current?.scrollIntoView(true)
                    break;
                case HeaderButtonEnum.COVERAGES:
                    listRef.current?.scrollIntoView(true)
                    setCoverageSelected(true)
                    if (coverages.length > 0)
                        getImagesUrlByEvent()
                    break;
                case HeaderButtonEnum.SCHEDULE:
                    listRef.current?.scrollIntoView(true)
                    setCoverageSelected(false)
                    if (schedule.length > 0)
                        getImagesUrlByEvent()
                    break;
                case HeaderButtonEnum.ABOUT:
                    aboutRef.current?.scrollIntoView(true)
                    break;
            }
        }
    }

    function handleCoverageSelected(value: string) {
        switch (value) {
            case EventsEnum.COVERAGES:
                setCoverageSelected(true)
                break;
            case EventsEnum.SCHEDULE:
                setCoverageSelected(false)
                break
            default:
                console.error('Error selecting event type. Error location : index.tsx, handleCoverageSelected()')
        }
    }

    function handlePage(value: string, index?: number) {
        if (value) {
            switch (value) {
                case CarouselButtonAction.START:
                    setPage(1)
                    break
                case CarouselButtonAction.PREV:
                    if (page - 1 > 0)
                        setPage(page - 1)
                    break
                case CarouselButtonAction.SELECT:
                    if (index)
                        setPage(index)
                    break
                case CarouselButtonAction.NEXT:
                    if (page + 1 < (coverageSelected ?
                        Math.ceil(coverages.length / eventsPerPage) :
                        Math.ceil(schedule.length / eventsPerPage)))
                        setPage(page + 1)
                    break
                case CarouselButtonAction.END:
                    setPage(coverageSelected ?
                        Math.ceil(coverages.length / eventsPerPage) :
                        Math.ceil(schedule.length / eventsPerPage))
                    break
            }
        }
    }

    async function handleSelectedEvent(value: string) {
        setSelectedEvent(await getSelectedEvent(value))
    }

    useEffect(() => {
        const sortEvents = async (eventArray: AgitoEvent[]) => {
            const currentDate = new Date()
            const coveragesArray: AgitoEvent[] = []
            const scheduleArray: AgitoEvent[] = []
            eventArray.forEach((element) => {
                if (currentDate > element.date)
                    coveragesArray.push(element)
                else
                    scheduleArray.push(element)
            })
            setCoverages(coveragesArray)
            setSchedule(scheduleArray)
            if (coveragesArray.length > 0) {
                setMainEvent(await getSelectedEvent(coveragesArray[0].id))
                setSelectedEvent(await getSelectedEvent(coveragesArray[0].id))
            }
        }

        const getData = async () => {
            const data: ResponseEvent[] = await miniFetch(UrlEnum.EVENTS)
            const eventArray: AgitoEvent[] = []
            data.forEach((element: ResponseEvent) => {
                const stringArray = element.name.split('--')
                const [day, month, year] = stringArray[0].split('-').map(Number);
                try {
                    const event: AgitoEvent = {
                        id: element.id,
                        date: new Date(year, month - 1, day),
                        time: stringArray[1].replace(/\./g, ':'),
                        name: stringArray[2],
                        local: stringArray[3],
                        clicks: null
                        // pageId: 1,
                    }
                    eventArray.push(event)
                } catch (e) {
                    console.error(e)
                }

            })
            sortEvents(eventArray)
        }
        getData()
    }, [])

    return (
        <>
            <header ref={homeRef} className="flex-col justify-center">
                <div className="bg-orange drop-shadow-md h-14 text-white">
                    <button className="h-12 w-12 lg:hidden">
                        <img src="src/assets/menu.svg" alt="Ícone Menu" />
                    </button>
                    <div className="hidden lg:flex lg:justify-between lg:max-w-7xl lg:h-full mx-auto">
                        <Button value={HeaderButtonEnum.START} buttonClick={handleButtonClick}>início</Button>
                        <Button value={HeaderButtonEnum.COVERAGES} buttonClick={handleButtonClick}>coberturas</Button>
                        <Button value={HeaderButtonEnum.SCHEDULE} buttonClick={handleButtonClick}>agenda</Button>
                        <Button value={HeaderButtonEnum.ABOUT} buttonClick={handleButtonClick}>sobre</Button>
                    </div>
                </div>
                <div className="bg-gray h-5 shadow-inner"></div>
            </header>
            <main>
                <section className="bg-light-purple pb-20 pt-10 lg:pb-36">
                    <div className="lg:w-[720px] lg:h-[480px] lg:mx-auto">
                        <ImageCarousel imagesUrl={mainEvent?.imagesUrl ? mainEvent?.imagesUrl : null} buttonStyle={true}></ImageCarousel>
                        <div className="bg-gray h-16 rounded-b-lg flex gap-1.5 justify-around">
                            <div>
                                <img src="src/assets/star.svg" alt="" />
                                Evento
                            </div>
                            <div>
                                <img src="src/assets/location.svg" alt="" />
                                Local
                            </div>
                            <div>
                                <img src="src/assets/clock.svg" alt="" />
                                11 fev 2020
                            </div>
                            <div>
                                <img src="src/assets/clicks.svg" alt="" />
                                10
                            </div>
                        </div>
                    </div>
                    <p className="mx-auto mt-14 w-4/5 text-white text-lg lg:max-w-[720px]">
                        Seja bem-vindo ao meu site de eventos, onde você encontrará uma seleção das minhas melhores fotos de eventos recentes.
                        Estou sempre buscando capturar as emoções e momentos mais significativos de cada ocasião,
                        de forma que essas imagens se tornem uma recordação inesquecível.
                        Obrigado por visitar e espero que goste das minhas fotos tanto quanto eu gostei de capturá-las!
                    </p>
                </section>
                <section ref={listRef} className="bg-medium-purple py-20 lg:flex lg:justify-between lg:px-10">
                    <div>
                        <ImageCarousel imagesUrl={selectedEvent?.imagesUrl ? selectedEvent?.imagesUrl : null} multiple={true}></ImageCarousel>
                    </div>
                    <List handleCoverageSelected={handleCoverageSelected}
                        coverageSelected={coverageSelected}
                        handlePage={handlePage}>
                        {events.data.slice((page - 1) * eventsPerPage, (page * eventsPerPage)).map((element, index) => <ListItem key={index}
                            id={element.id}
                            name={element.name}
                            date={element.date}
                            time={element.time}
                            local={element.local}
                            type={events.type}
                            clicks={element.clicks}
                            handleSelectedEvent={handleSelectedEvent}></ListItem>)}
                    </List>
                </section>
                <section className="bg-dark-purple relative pb-20 pt-32" ref={aboutRef}>
                    <img src="src/assets/profile-placeholder.png" alt="Foto de perfil do Gabriel" className="w-80 rounded-full relative left-5 lg:left-60"/>
                    <div className="bg-light-purple text-white rounded-3xl w-[360px] mx-auto mt-10 mb-20 p-5 flex flex-col gap-5 drop-shadow-md">
                        <span className="font-bold text-3xl">Sobre mim</span>
                        <span className="text-lg">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
                            Phasellus pretium nulla vitae dignissim venenatis. Nulla sit amet tortor sem. Nam a digni</span>
                    </div>
                    <a href="#" target="_blank" className="bg-ultra-light-purple w-32 h-32 absolute top-80 left-64 flex justify-center items-center drop-shadow-md rounded-xl">
                        <img src="src/assets/instagram-logo.svg" alt="Ícone do Instagram" className="w-24 h-24"/>
                    </a>
                </section>
            </main>
            <footer className="bg-light-purple h-12 flex justify-center items-center ">
                <span className="text-white text-sm lg:text-xs">© 2023 - GABRIEL AGITO - TODOS OS DIREITOS RESERVADOS</span>
            </footer>
            <div className="hidden">
                <button ref={returnRef} onClick={(e) => handleButtonClick(e.currentTarget.value)} value={HeaderButtonEnum.START}>
                    <img src="" alt="" />
                    <span>SUBIR</span>
                </button>
            </div>
        </>
    )
}

// page x : ((x-1)*eventsPerPage) - ((x*eventsPerPage) - 1)
// page 1 : 0 - 5
// page 2 : 6 - 11
// page 3 : 12 - 17
// page 4 : 18 - 23

//1 - 6
// page x : events.length / (eventsPerPage)