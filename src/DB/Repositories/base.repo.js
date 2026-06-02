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

    deleteOneDoc(filter) {
        return this.model.deleteOne(filter);
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