export class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    Createdoc(data) {
        return this.model.create(data);
    }

    FindOneDoc(filter, options = {}) {
        return this.model.findOne(filter, null, options);
    }
    FindById(id, options = {}) {
        return this.model.findById(id, null, options);
    }

    deleteOneDoc(filter, options = {}) {
        const {session, ...otherOptions} = filter;
        const query = this.model.deleteOne(filter, options);
        if(session) {
            query.session(session);
        }
        return this.model.deleteOne(filter, options);
    }

    deleteManyDocs(filter, options = {}) {
        const { session, ...otherOptions } = options;
        const query = this.model.deleteMany(filter, otherOptions);
        if (session) {
            query.session(session);
        }
        return query;
    }

    deleteById(id, options = {}) {
        const {session, ...otherOptions} = options;
        const query = this.model.findByIdAndDelete(id, otherOptions);
        if(session) {
            query.session(session);
        }
        return query;
    }

    FindDocs(filter, options = {}) {
        return this.model.find(filter, null, options);
    }

    UpdateById({_id, updateData, options = { new: true }}) {
        return this.model.findByIdAndUpdate(_id, updateData, { returnDocument: 'after', runValidators: true });
    }
    FindAllDocs(options = {}) {
        return this.model.find({}, null, options);
    }   

}