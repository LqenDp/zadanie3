
Vue.component('task-card', {
    props: {
        task: {  
            type: Object,
            required: true
        }
    },
    template: `
        <div class="task-card">
            <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span class="task-date">{{ task.createdAt }}</span>
            </div>
            <div class="task-description">{{ task.description }}</div>
            <div class="task-deadline">Дедлайн: {{ task.deadline }}</div>
        </div>
    `
})
Vue.component('kanban-board', {
    props: {
        tasks: {  
            type: Array,
            required: true
        }
    },
    template: `
        <div class="kanban-board">
        <div 
            class="column" 
            v-for="column in columns" 
            :key="column.id"
        >
            <h2>{{ column.title }}</h2>
            <div class="task-list">
                <!-- Фильтруем задачи по статусу колонки -->
                <task-card
                    v-for="task in filteredTasks(column.id)"
                    :key="task.id"
                    :task="task"
                ></task-card>
            </div>
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
    },
    methods: {
        filteredTasks(columnId) {
            return this.tasks.filter(task => task.status === columnId);
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
               title: 'sss',
               description: 'dom',
               deadline: '2026-03-17',
               createdAt: new Date().toLocaleString(),
               status: 'planned'
           },
           {
               id: 2,
               title: 'ddd',
               description: 'erf',
               deadline: '2026-03-16',
               createdAt: new Date().toLocaleString(),
               status: 'in-progress'
           }
       ]
   }
})