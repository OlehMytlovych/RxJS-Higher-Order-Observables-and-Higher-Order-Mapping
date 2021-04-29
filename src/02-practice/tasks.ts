import { run } from './../03-utils';
import { catchError, mergeMap, concatMap, delay, exhaustMap, switchMap, take, filter, concatMapTo, mergeMapTo, switchMapTo, tap } from 'rxjs/operators';
import { fromEvent, range, interval, of, from, Observable, NEVER, concat,  } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

// Task 1. concatMap()
// Реализуйте функцию, которая создает Observable, который выдает числа в диапазоне от 1 до 10 
// через случайное количество времени в диапазоне от 1с до 5с
// Используйте функцию randomDelay(), of(), concatMap(), delay()
// Проведите эксперимент заменяя метод concatMap на mergeMap, switchMap, exhaustMap
(function task1(): void {
    function randomDelay(min: number, max: number) {
        const pause = Math.floor( Math.random() * ( max - min ) ) + min;
        console.log(pause);
        return pause;
    }

    const range$ = range(1, 10);

    const stream$ = range$.pipe(
        exhaustMap(i => of(i).pipe(delay(randomDelay(1000, 5000))))
    );

    //run(stream$);
})();

// Task 2. mergeMap()
// Испольуя функцию emulateHttpCall и массив идентификаторов ids
// организуйте получение объектов в параллель.
(function task2(): void {
    function emulateHttpCall(id: number): Observable<any> {
        switch (id) {
          case 1:
            return of({ id: 1, name: 'Anna' }).pipe(delay(4000)); // <-- emulation of http call, which returns Observable after 4s
          case 2:
            return of({ id: 2, name: 'Boris' }).pipe(delay(3000)); // <-- pause 3s
          case 3:
            return of({ id: 3, name: 'Clara' }).pipe(delay(2000)); // <-- pause 2s
        }
    }

    const ids = [1, 3, 2, 2, 3, 3, 1, 2, 3];

    const stream$ = from(ids).pipe(
        mergeMap(id => emulateHttpCall(id))
    )
    
    //run(stream$);
})();


// Task 3. switchMap()
// Создайте внешний поток, используя fromFetch('https://api.github.com/users?per_page=5')
// Создайте для результата внешнего потока внутренний поток response.json(), используя switchMap()
// Дополнительно фильтруйте элементы внешнего потока по условию response.ok === true
(function task3(): void {
    const stream$ = fromFetch('https://api.github.com/users?per_page=5')
        .pipe(
            filter(resp => resp.ok === true),
            switchMap(resp => resp.json())
        );

    //run(stream$);
})();

// Task 4. exhaustMap()
// Создайте внешний поток из событий click по кнопке runBtn.
// Во время первого клика по кнопке создайте внутренний поток, используя interval(1000)
// Элементы внутреннего потока должны попасть в выходной поток. 
// Игнорируйте все последующие клики на кнопке
(function task4() {
    const clicks$ = fromEvent(document.getElementById('runBtn'), 'click');
    const stream$ = clicks$.pipe(
        exhaustMap(e => interval(1000))
    )

    // run(stream$);
})();


// Task 5. concatMapTo()
// Создайте внешний поток событий click по кнопке runBtn.
// Во время клика по кнопке, создайте внутренний поток из слов 
// 'Hello', 'World!', используя of() и объедините его с потоком NEVER
// Добавьте слова внутреннего потока в результирующий поток
// Обясните результат нескольких кликов по кнопке
(function task5() {
    const clicks$ = fromEvent(document.getElementById('runBtn'), 'click');
    const combined$ = concat(of('hello', 'world'), NEVER)
    const stream$ = clicks$.pipe(concatMapTo(combined$));

    //run(stream$); // as we're using concat with NEVER, it'll never complete with result
})();

// Task 6. mergeMapTo()
// Задание аналогично предыдущему, только теперь вместо concatMap используйте mergeMap
// Обясните результат нескольких кликов по кнопке
(function task6() {
    const clicks$ = fromEvent(document.getElementById('runBtn'), 'click');
    const combined$ = concat(of('hello', 'world'), NEVER)
    const stream$ = clicks$.pipe(mergeMapTo(combined$));

   //run(stream$);
})();

// Task7. switchMapTo()
// Создайте внешний поток событий click по кнопке runBtn.
// Во время клика по кнопке, создайте внутренний поток, 
// который будет выдавать числа от 0 до 4 с интервалом в 1с.
// Каждый новый клик по кнопке должен начинать выдавать значения внутреннего потока 
// начииная с 0, недожидаясь завершения выдачи всех предыдущих чисел.
(function task7() {
    const clicks$ = fromEvent(document.getElementById('runBtn'), 'click');
    const stream$ = clicks$.pipe(
        switchMapTo(interval(1000).pipe(take(5)))
    );

   // run(stream$);
})();

// MyTask1. switchMap()
//  Create inner stream of input events of the 'text-field' input.
//  On input, create inner stream that would dispatch input's value as long as there is no new value in 2s.
(function mytask1() {
    const inputs$ = fromEvent(document.getElementById('text-field'), 'input');
    const stream$ = inputs$.pipe(
        switchMap(e => {
            const evTarget: EventTarget = e.target;
            const input: HTMLInputElement = evTarget as HTMLInputElement;
            return of(input.value).pipe(delay(2000));
        })
    );

    //run(stream$);
})();

// MyTask2. concatMap(), switchmap()
// fetch json of 4 pages of users from github having array of numbers (number of users per page)
(function mytask2() {
    const pageCounts = [5, 10, 15, 20];
    
    const stream$ = from(pageCounts).pipe(
        concatMap(pageCount => {
            return fromFetch(`https://api.github.com/users?per_page=${pageCount}`).pipe(
                switchMap(resp => resp.json())
            )
        })
    );

    run(stream$);
})();

export function runner() {}