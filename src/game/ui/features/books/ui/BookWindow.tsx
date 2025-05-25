// BookWindow.tsx
import {useState, useEffect, useRef, useLayoutEffect} from "react";
import "../styles/bookWindow.scss"

// Типы данных
type Page = {
    id: number;
    content: string;
};

type BookWindowProps = {
    content?: string;
    title?: string;
    fetchUrl?: string;
    img?: string;
};

export const BookWindow = ({ content = "Проверка", title = "Интерактивная книга", fetchUrl, img }: BookWindowProps) => {
    // Состояние для страниц
    const [pages, setPages] = useState<Page[]>([]);
    // Текущий разворот
    const [currentSpread, setCurrentSpread] = useState<number>(0);
    // Состояние анимации
    const [isFlipping, setIsFlipping] = useState<boolean>(false);
    // Направление анимации
    const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
    // Состояние загрузки
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // Состояние ошибки
    const [error, setError] = useState<string | null>(null);

    // Рассчитываем индексы текущих страниц
    const leftPageIndex = currentSpread * 2;
    const rightPageIndex = currentSpread * 2 + 1;

    // Референс для измерения размера контейнера страницы
    const pageRef = useRef<HTMLDivElement>(null);

    // Функция для разбиения текста на страницы с учетом вместимости
    const splitContentIntoPages = (contentText: string) => {
        if (!pageRef.current) {
            console.error("Page ref is not available");
            return;
        }

        setIsLoading(true);

        const pageHeight = pageRef.current.clientHeight - 48;
        const pageWidth = pageRef.current.clientWidth - 48;

        console.log(`Page dimensions: ${pageWidth}x${pageHeight}px`); // Добавьте лог

        // Создаем временный элемент для расчета
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.width = `${pageWidth}px`;
        tempDiv.style.fontFamily = "serif";
        tempDiv.style.fontSize = "14px";
        tempDiv.style.lineHeight = "1.5";
        document.body.appendChild(tempDiv);

        const paragraphs = contentText.split("\n").filter(p => p.trim() !== "");
        const formattedPages: Page[] = [];
        let currentPageContent = "";
        let pageId = 1;

        paragraphs.forEach(paragraph => {
            tempDiv.textContent = currentPageContent + (currentPageContent ? "\n\n" : "") + paragraph;

            if (tempDiv.scrollHeight > pageHeight) {
                if (currentPageContent) {
                    formattedPages.push({ id: pageId, content: currentPageContent });
                    pageId++;
                    currentPageContent = paragraph;
                } else {
                    const words = paragraph.split(" ");
                    let partialParagraph = "";

                    for (const word of words) {
                        tempDiv.textContent = partialParagraph + (partialParagraph ? " " : "") + word;

                        if (tempDiv.scrollHeight > pageHeight) {
                            if (partialParagraph) {
                                formattedPages.push({ id: pageId, content: partialParagraph });
                                pageId++;
                                partialParagraph = word;
                            } else {
                                formattedPages.push({ id: pageId, content: word });
                                pageId++;
                                partialParagraph = "";
                            }
                        } else {
                            partialParagraph += (partialParagraph ? " " : "") + word;
                        }
                    }
                    currentPageContent = partialParagraph;
                }
            } else {
                currentPageContent += (currentPageContent ? "\n\n" : "") + paragraph;
            }
        });

        if (currentPageContent) {
            formattedPages.push({ id: pageId, content: currentPageContent });
        }

        document.body.removeChild(tempDiv);

        console.log("Formatted pages:", formattedPages); // Добавьте лог

        setPages(formattedPages);
        setCurrentSpread(0);
        setIsLoading(false);
    };

    // Эффект для загрузки контента при монтировании или изменении props
    useLayoutEffect(() => {
        if (content && content.trim() === "") {
            // Обработка пустого контента
            return;
        }
        if (pageRef.current) {
            console.log("Current page size:", {
                width: pageRef.current.clientWidth,
                height: pageRef.current.clientHeight
            });
        }
        console.log('Content received:', content); // Проверьте что контент приходит
        console.log('Pages state:', pages); // Проверьте состояние страниц
        if (fetchUrl) {
            setIsLoading(true);
            fetch(fetchUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Ошибка загрузки контента");
                    }
                    return response.text();
                })
                .then(data => {
                    splitContentIntoPages(data);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        } else if (content) {
            splitContentIntoPages(content);
        } else {
            // Демо-контент, если ничего не передано
            const demoContent =
                "Это первая страница нашей книги. Здесь может быть любой текст, который вы захотите отобразить.\n\n" +
                "Вторая часть текста. Текст будет разбит на страницы автоматически в зависимости от вместимости страницы.\n\n" +
                "Анимация перелистывания создает эффект настоящей книги. Обратите внимание на плавную анимацию при переходе между страницами.\n\n" +
                "Страницы идут парами, как в настоящей книге. Номера страниц увеличиваются на единицу для каждой страницы.\n\n" +
                "В настоящей книге левая и правая страница идут последовательно. Это демонстрация автоматического разбиения текста.\n\n" +
                "Вы можете передать любой текст в компонент через пропс content или загрузить его из внешнего источника через fetchUrl.\n\n" +
                "Текст будет автоматически разбит на страницы с учетом размера страницы, с правильным переносом строк и нумерацией.";

            splitContentIntoPages(demoContent);
        }
    }, [content, fetchUrl]);

    // Функция для перелистывания назад
    const flipToPreviousSpread = () => {
        if (currentSpread > 0 && !isFlipping) {
            setFlipDirection('backward');
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentSpread(currentSpread - 1);
                setIsFlipping(false);
            }, 500); // Длительность анимации
        }
    };

    // Функция для перелистывания вперед
    const flipToNextSpread = () => {
        if (rightPageIndex < pages.length - 1 && !isFlipping) {
            setFlipDirection('forward');
            setIsFlipping(true);
            setTimeout(() => {
                setCurrentSpread(currentSpread + 1);
                setIsFlipping(false);
            }, 500); // Длительность анимации
        }
    };

    // Определяем классы для анимации
    const getPageClass = (side: 'left' | 'right') => {
        const baseClass = `book__page book__page--${side}`;

        if (side === 'left' && isFlipping && flipDirection === 'backward') {
            return `${baseClass} book__page--flipping-backward`;
        } else if (side === 'right' && isFlipping && flipDirection === 'forward') {
            return `${baseClass} book__page--flipping-forward`;
        }

        return baseClass;
    };

    // Функция форматирования текста с сохранением переносов строк
    const formatTextWithLineBreaks = (text: string) => {
        return text.split("\n").map((line, index) => (
            <p key={index} className={line.trim() === "" ? "empty-line" : ""}>{line}</p>
        ));
    };

    if (error) {
        return (
            <div className="error-container">
                <p>Ошибка: {error}</p>
            </div>
        );
    }

    return (
        <div className="book-window">
            <h1 className="book-window__title">{title}</h1>

            {isLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <>
                    {/* Книжный компонент */}
                    <div className="book">
                        {/* Левая часть книги */}
                        <div
                            className={getPageClass('left')}
                            onClick={flipToPreviousSpread}
                            ref={pageRef}
                            key={`left-${leftPageIndex}`} // Добавьте key
                        >
                            {/* Содержимое левой страницы */}
                            <div className="book__page-content">
                                {leftPageIndex < pages.length ? (
                                    <>
                                        <div className="page-text">
                                            {formatTextWithLineBreaks(pages[leftPageIndex]?.content)}
                                        </div>
                                        <div className="page-number page-number--left">
                                            Страница {pages[leftPageIndex]?.id}
                                        </div>
                                    </>
                                ) : (
                                    <div className="book-cover">Обложка</div>
                                )}
                            </div>
                            {/* Край для перелистывания */}
                            <div className="page-edge page-edge--left"></div>
                        </div>

                        {/* Правая часть книги */}
                        <div
                            className={getPageClass('right')}
                            onClick={flipToNextSpread}
                            ref={pageRef}
                        >
                            {/* Содержимое правой страницы */}
                            <div className="book__page-content">
                                {rightPageIndex < pages.length ? (
                                    <>
                                        <div className="page-text">
                                            {formatTextWithLineBreaks(pages[rightPageIndex]?.content)}
                                        </div>
                                        <div className="page-number page-number--right">
                                            Страница {pages[rightPageIndex]?.id}
                                        </div>
                                    </>
                                ) : (
                                    <div className="book-cover">
                                        {pages.length > 0 ? "Конец книги" : "Загрузка..."}
                                    </div>
                                )}
                            </div>
                            {/* Край для перелистывания */}
                            <div className="page-edge page-edge--right"></div>
                        </div>

                        {/* Корешок книги */}
                        <div className="book__spine"></div>
                    </div>

                    {/* Навигация по книге */}
                    <div className="navigation">
                        <button
                            onClick={flipToPreviousSpread}
                            disabled={currentSpread === 0}
                            className={currentSpread === 0 ? "navigation__button navigation__button--disabled" : "navigation__button"}
                        >
                            Предыдущий разворот
                        </button>
                        <button
                            onClick={flipToNextSpread}
                            disabled={rightPageIndex >= pages.length - 1}
                            className={rightPageIndex >= pages.length - 1 ? "navigation__button navigation__button--disabled" : "navigation__button"}
                        >
                            Следующий разворот
                        </button>
                    </div>

                    <div className="pagination-info">
                        {pages.length > 0 ? (
                            <>
                                Разворот {currentSpread + 1} из {Math.ceil(pages.length / 2)}
                                {currentSpread > 0 && rightPageIndex < pages.length ?
                                    ` (страницы ${pages[leftPageIndex]?.id}-${pages[rightPageIndex]?.id})` :
                                    currentSpread === 0 ?
                                        ` (страница ${pages[rightPageIndex]?.id})` :
                                        ` (страница ${pages[leftPageIndex]?.id})`
                                }
                            </>
                        ) : "Загрузка книги..."}
                    </div>
                </>
            )}
        </div>
    );
};

export default BookWindow;