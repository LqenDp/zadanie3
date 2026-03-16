
Vue.component('kanban-board', {
    template: `
        <div class="kanban-board">
            <div 
                class="column" 
                v-for="column in columns" 
                :key="column.id"
            >
                <h2>{{ column.title }}</h2>
            </div>
        </div>
    `,
    data() {
        return {
            columns: [
                { id: 'planned', title: 'Запланированные задачи' },
                { id: 'in-progress', title: 'Задачи в работе' },
                { id: 'testing', title: 'Тестирование' },
                { id: 'completed', title: 'Выполненные задачи' }
            ]
        }
    }
})

let app = new Vue({
   el: '#app',  
   data: {
       title: 'Kanban Board',
       tasks: [  
           {
               id: 1,
               title: 'Изучить Vue.js',
               description: 'Понять основы фреймворка',
               deadline: '2026-03-20',
               createdAt: new Date().toLocaleString(),
               status: 'planned'
           }
       ]
   }
})