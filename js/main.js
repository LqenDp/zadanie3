let eventBus = new Vue();

Vue.component('task-modal', {
    props: {
        task: {           
            type: Object,
            default: null
        },
        isNew: {          
            type: Boolean,
            default: false
        },
        returnReason: { 
           type: Boolean,
           default: false
       }
    },
    template: `
     <div class="modal" @click.self="$emit('close')">
        <div class="modal-content">
            <h3>{{ modalTitle }}</h3>
            <template v-if="!returnReason">
                <input 
                    v-model="formData.title" 
                    placeholder="Заголовок задачи"
                >
                <textarea 
                    v-model="formData.description" 
                    placeholder="Описание задачи"
                ></textarea>
                <input 
                    v-model="formData.deadline" 
                    type="date"
                >
            </template>
            <div v-if="returnReason" class="reason-input">
                <input 
                    v-model="formData.returnReason" 
                    placeholder="Укажите причину возврата"
                >
            </div>
         
                <div class="modal-actions">
                    <button @click="$emit('close')">Отмена</button>
                    <button @click="saveTask">Сохранить</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            formData: {
                title: '',
                description: '',
                deadline: '',
                returnReason: ''
            }
        }
    },
    computed: {
        modalTitle() {
            if (this.returnReason) return 'Укажите причину возврата';
            return this.isNew ? 'Новая задача' : 'Редактирование задачи';
        }
    },
    methods: {
        saveTask() {
            this.$emit('save', this.formData);
        }
    },
    mounted() {
        if (this.task) {
            this.formData = {
                title: this.task.title,
                description: this.task.description,
                deadline: this.task.deadline,
                returnReason: this.task.returnReason || ''
            };
        }
    }
})
Vue.component('task-card', {
    props: {
        task: {
            type: Object,
            required: true
        },
        columnId: {  
            type: String,
            required: true
        }
    },
    template: `
        <div class="task-card">
            <div class="task-header">
                <span class="task-title">{{ task.title }}</span>
                <span class="task-date">создано: {{ task.createdAt }}</span>
            </div>
       
            <div class="task-description">{{ task.description }}</div>
       
            <div class="task-deadline">
                Дедлайн: {{ task.deadline }}
                <span v-if="task.editedAt"> | ред.: {{ task.editedAt }}</span>
            </div>
            <div v-if="task.returnReason" class="task-deadline" style="color: #ff4444;">
                Причина возврата: {{ task.returnReason }}
            </div>
       
            <div class="task-actions">
                <button @click="editTask">Редактировать</button>
                <button @click="deleteTask" v-if="columnId === 'planned'">Удалить</button>
                <button @click="moveTask" v-if="!isLastColumn">
                    {{ moveButtonText }}
                </button>
                <button @click="returnToWork" v-if="columnId === 'testing'">
                    Вернуть в работу
                </button>
            </div>
        </div>
    `,
    computed: {
        isLastColumn() {
            return this.columnId === 'completed';
        },
       
        moveButtonText() {
            const moves = {
                'planned': 'В работу',
                'in-progress': 'В тестирование',
                'testing': 'В выполненные'
            };
            return moves[this.columnId] || 'Далее';
        }
    },
    methods: {
        editTask() {
            eventBus.$emit('edit-task', this.task);
        },
        deleteTask() {
                eventBus.$emit('delete-task', this.task.id);
        },
        moveTask() {
            const moves = {
                'planned': 'in-progress',
                'in-progress': 'testing',
                'testing': 'completed'
            };
           
            eventBus.$emit('move-task', {
                taskId: this.task.id,
                toColumn: moves[this.columnId]
            });
        },
        returnToWork() {
            eventBus.$emit('return-task', this.task.id);
       }
    }
})
Vue.component('kanban-board', {
    props: {
        tasks: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
            <button @click="openNewTaskModal" style="margin-bottom: 20px;">
                + Новая задача
            </button>
       
        <div class="kanban-board">
                <div 
                    class="column" 
                    v-for="column in columns" 
                    :key="column.id"
                >
                <h2>{{ column.title }}</h2>
                <div class="task-list">
                    <task-card
                        v-for="task in filteredTasks(column.id)"
                        :key="task.id"
                        :task="task"
                        :column-id="column.id"  
                    ></task-card>
                </div>
            </div>
        </div>
       
        <task-modal
            v-if="showModal"
            :task="editingTask"      
            :is-new="isNewTask"      
            :return-reason="showReturnReason" 
            @save="saveTask"
            @close="closeModal"
        ></task-modal>
        </div>
    `,
    data() {
        return {
            columns: [
                { id: 'planned', title: 'Запланированные задачи' },
                { id: 'in-progress', title: 'Задачи в работе' },
                { id: 'testing', title: 'Тестирование' },
                { id: 'completed', title: 'Выполненные задачи' }
            ],
            showModal: false,
            editingTask: null,  
            isNewTask: false,
            showReturnReason: false,
            returnTaskId: null
        }
    },
    methods: {
        filteredTasks(columnId) {
            return this.tasks.filter(task => task.status === columnId);
        },
       
        openNewTaskModal() {
            this.showModal = true;
            this.editingTask = null;  
            this.isNewTask = true;
            this.showReturnReason = false;    
        },
       
        editTask(task) {
            this.showModal = true;
            this.editingTask = task;  
            this.isNewTask = false;    
            this.showReturnReason = false;
        },
        returnTask(taskId) {
            this.showModal = true;
            this.showReturnReason = true;
            this.returnTaskId = taskId;   
        },
       
        saveTask(formData) {
            if (this.showReturnReason && this.returnTaskId) {
                eventBus.$emit('task-returned', {
                    taskId: this.returnTaskId,
                    reason: formData.returnReason
                });
                this.closeModal();
                return;
            }

            if (this.isNewTask) {
                eventBus.$emit('create-task', formData);
            } else {
                eventBus.$emit('update-task', {
                    taskId: this.editingTask.id,
                    ...formData
                });
            }
            this.closeModal();
        },
       
        closeModal() {
            this.showModal = false;
            this.editingTask = null;
            this.isNewTask = false;
            this.showReturnReason = false;
            this.returnTaskId = null;
        }
    },
    mounted() {
        eventBus.$on('edit-task', this.editTask);
        eventBus.$on('return-task', this.returnTask);
        eventBus.$on('delete-task', (taskId) => {
            eventBus.$emit('delete-task', taskId);
        });
    }
})

let app = new Vue({
    el: '#app',
    data: {
        title: 'Kanban Board',
        tasks: [
            {
                id: 1,
                title: 'ыфвв',
                description: 'ыфв',
                deadline: '2026-03-17',
                createdAt: new Date().toLocaleString(),
                status: 'planned'
            },
            {
                id: 2,
                title: 'ddd',
                description: 'dom',
                deadline: '2026-03-16',
                createdAt: new Date().toLocaleString(),
                status: 'in-progress'
            },
            {
                id: 3,
                title: 'ууу',
                description: 'раоо',
                deadline: '2026-03-18',
                createdAt: new Date().toLocaleString(),
                status: 'testing'
            },
            {
                id: 4,
                title: 'aaa',
                description: 'AA',
                deadline: '2026-03-19',
                createdAt: new Date().toLocaleString(),
                status: 'completed'
            }
        ]
    },
    methods: {
        generateId() {
            return Date.now() + Math.random().toString(36).substr(2, 9);
        },
       
        createTask(taskData) {
            const newTask = {
                id: this.generateId(),
                ...taskData,
                createdAt: new Date().toLocaleString(),
                status: 'planned'
            };
            this.tasks.push(newTask);
        },
       
        updateTask(taskData) {
            const index = this.tasks.findIndex(t => t.id === taskData.taskId);
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    ...taskData,
                    editedAt: new Date().toLocaleString()  // Добавляем временной штамп
                };
                this.tasks = [...this.tasks];
            }
        },
       
        deleteTask(taskId) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
        },
        moveTask(data) {
            const index = this.tasks.findIndex(t => t.id === data.taskId);
            if (index !== -1) {
                this.tasks[index].status = data.toColumn;
                this.tasks = [...this.tasks];
            }
        },
        taskReturned(data) {
            const index = this.tasks.findIndex(t => t.id === data.taskId);
            if (index !== -1) {
                this.tasks[index].status = 'in-progress';
                this.tasks[index].returnReason = data.reason;
                this.tasks[index].editedAt = new Date().toLocaleString();
                this.tasks = [...this.tasks];
            }
        }
    },
    mounted() {
        eventBus.$on('create-task', this.createTask);
        eventBus.$on('update-task', this.updateTask);  
        eventBus.$on('delete-task', this.deleteTask);
        eventBus.$on('move-task', this.moveTask);  
        eventBus.$on('task-returned', this.taskReturned);
    }
})