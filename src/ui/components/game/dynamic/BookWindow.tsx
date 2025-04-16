// BookWindow.tsx
import { useState, useEffect, useRef } from "react";
import "../../../style/bookWindow.scss"

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

const BookWindow = ({ content = "", title = "Интерактивная книга", fetchUrl, img }: BookWindowProps) => {
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
        setIsLoading(true);

        // Используем setTimeout для отрисовки DOM перед измерениями
        setTimeout(() => {
            if (!pageRef.current) {
                setIsLoading(false);
                return;
            }

            // Параметры страницы
            const pageHeight = pageRef.current.clientHeight - 48; // Высота минус padding и место для номера
            const pageWidth = pageRef.current.clientWidth - 48; // Ширина минус padding

            // Создаем временный элемент для расчета
            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.visibility = "hidden";
            tempDiv.style.width = pageWidth + "px";
            tempDiv.style.fontFamily = "serif";
            tempDiv.style.fontSize = "14px";
            tempDiv.style.lineHeight = "1.5";
            document.body.appendChild(tempDiv);

            // Разбиваем текст на параграфы
            const paragraphs = contentText.split("\n").filter(p => p.trim() !== "");

            const formattedPages: Page[] = [];
            let currentPageContent = "";
            let pageId = 1;

            // Обрабатываем каждый параграф
            paragraphs.forEach(paragraph => {
                // Добавляем параграф к временному элементу
                tempDiv.textContent = currentPageContent + (currentPageContent ? "\n\n" : "") + paragraph;

                // Если содержимое не умещается на странице, создаем новую страницу
                if (tempDiv.scrollHeight > pageHeight) {
                    // Если текущее содержимое страницы уже заполнено
                    if (currentPageContent) {
                        formattedPages.push({ id: pageId, content: currentPageContent });
                        pageId++;
                        currentPageContent = paragraph;
                    } else {
                        // Если параграф слишком большой, разбиваем его по словам
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
                                    // Слово слишком длинное, добавляем его частично
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
                    // Добавляем параграф к текущей странице
                    currentPageContent += (currentPageContent ? "\n\n" : "") + paragraph;
                }
            });

            // Добавляем последнюю страницу, если она не пуста
            if (currentPageContent) {
                formattedPages.push({ id: pageId, content: currentPageContent });
            }

            // Удаляем временный элемент
            document.body.removeChild(tempDiv);

            // Обновляем состояние страниц
            setPages(formattedPages);
            setCurrentSpread(0);
            setIsLoading(false);
        }, 0);
    };

    // Эффект для загрузки контента при монтировании или изменении props
    useEffect(() => {
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
                            ref={leftPageIndex === 0 ? null : pageRef}
                        >
                            {/* Содержимое левой страницы */}
                            <div className="book__page-content">
                                {currentSpread > 0 ? (
                                    <>
                                        <div className="page-text">
                                            {formatTextWithLineBreaks(pages[leftPageIndex]?.content || "Пустая страница")}
                                        </div>
                                        <div className="page-number page-number--left">
                                            Страница {pages[leftPageIndex]?.id || ""}
                                        </div>
                                    </>
                                ) : (
                                    <div className="book-cover"
                                    style={{backgroundImage: `url(${img})`, backgroundPosition: "center", backgroundSize: "cover"}}>
                                    </div>
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
                                            {formatTextWithLineBreaks(pages[rightPageIndex]?.content || "Пустая страница")}
                                        </div>
                                        <div className="page-number page-number--right">
                                            Страница {pages[rightPageIndex]?.id || ""}
                                        </div>
                                    </>
                                ) : (
                                    <div className="book-cover">
                                        Конец книги
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