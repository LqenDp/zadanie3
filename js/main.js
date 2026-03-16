let eventBus = new Vue();
Vue.component('task-modal', {
   template: `
     <div class="modal" @click.self="$emit('close')">
       <div class="modal-content">
         <h3>Новая задача</h3>
         
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
               deadline: ''
           }
       }
   },
   methods: {
       saveTask() {
           
           this.$emit('save', this.formData);

           this.formData = {
               title: '',
               description: '',
               deadline: ''
           };
       }
   }
})
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
             ></task-card>
           </div>
         </div>
       </div>
       
       <task-modal
         v-if="showModal"
         @save="saveNewTask"
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
           showModal: false  
       }
   },
   methods: {
       filteredTasks(columnId) {
           return this.tasks.filter(task => task.status === columnId);
       },
       
       openNewTaskModal() {
           this.showModal = true;
       },
       
       closeModal() {
           this.showModal = false;
       },
       
       saveNewTask(formData) {
           eventBus.$emit('create-task', formData);
           this.closeModal();
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
       }
   },
   mounted() {
       eventBus.$on('create-task', this.createTask);
   }
})